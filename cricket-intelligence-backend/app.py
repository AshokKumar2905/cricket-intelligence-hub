from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import pandas as pd
import os
import jwt
import datetime
import re
import urllib.parse
from functools import wraps
from werkzeug.utils import secure_filename

app = Flask(__name__)

# --- CONFIGURATION ---
SECRET_KEY = "cricket_intel_secure_gateway_key"
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# TACTICAL CORS UPLINK: Explicitly permissive for Docker orchestration
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# TACTICAL DATABASE UPLINK
MONGO_HOST = os.environ.get("MONGO_HOST", "localhost")
client = MongoClient(f"mongodb://{MONGO_HOST}:27017/")
db = client["cricket_db"]

current_tournament = "TOURNAMENT ANALYTICS"

# --- UTILITY ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_db_data(data):
    if isinstance(data, list): return [clean_db_data(item) for item in data]
    if isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            if k == "_id": new_dict["id"] = str(v)
            else: new_dict[k] = clean_db_data(v)
        return new_dict
    return data

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token: return jsonify({'message': 'Token missing'}), 401
        try:
            token = token.split(" ")[1]
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except: return jsonify({'message': 'Token invalid'}), 401
        return f(*args, **kwargs)
    return decorated

# --- AUTH ROUTES ---
@app.route("/login", methods=["POST"])
def login():
    auth = request.json
    if auth.get("username") == "admin" and auth.get("password") == "cricket123":
        token = jwt.encode({
            'user': 'admin',
            'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({"status": "success", "data": {"token": token, "username": "Admin Operator"}})
    return jsonify({"status": "error", "message": "Invalid Identity"}), 401

# --- PLAYER ROSTER & PHOTO ---
@app.route("/players", methods=["GET", "POST"])
def handle_players():
    if request.method == "GET":
        return jsonify({"status": "success", "data": clean_db_data(list(db.players.find()))})
    res = db.players.insert_one(request.json)
    return jsonify({"status": "success", "data": clean_db_data(db.players.find_one({"_id": res.inserted_id}))})

@app.route("/players/<id>", methods=["PUT", "DELETE"])
def update_delete_player(id):
    if request.method == "DELETE":
        db.players.delete_one({"_id": ObjectId(id)})
        return jsonify({"status": "success"})
    db.players.update_one({"_id": ObjectId(id)}, {"$set": request.json})
    return jsonify({"status": "success"})

@app.route("/players/<id>/photo", methods=["POST"])
def upload_player_photo(id):
    file = request.files.get('photo')
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{id}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        url = f"/uploads/{filename}"
        db.players.update_one({"_id": ObjectId(id)}, {"$set": {"photo": url}})
        return jsonify({"status": "success", "data": {"photo": url}})
    return jsonify({"error": "Failed"}), 400

# --- FIXTURES ---
@app.route("/matches", methods=["GET", "POST"])
def handle_matches():
    if request.method == "GET":
        return jsonify({"status": "success", "data": clean_db_data(list(db.matches.find()))})
    db.matches.insert_one(request.json)
    return jsonify({"status": "success"})

@app.route("/matches/<id>", methods=["PUT"])
def update_match(id):
    try:
        data = request.json
        # Cleanup payload to prevent MongoDB immutable field errors
        update_data = {k: v for k, v in data.items() if k not in ["_id", "id"]}
        db.matches.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/matches/<id>", methods=["DELETE"])
def delete_match(id):
    try:
        db.matches.delete_one({"_id": ObjectId(id)})
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- PERFORMANCE LOGGING ---
@app.route("/performance", methods=["POST"])
def log_performance():
    try:
        data = request.json
        
        # LOGIC FIX: Bridge manual entry to raw_match_data for Dashboard visibility
        # We insert a summary record into the collection aggregated by /dashboard-all
        db.raw_match_data.insert_one({
            "player": data.get('player'),
            "striker": data.get('striker'),
            "runs": int(data.get('runs', 0)),
            "team": data.get('team'),
            "over": data.get('over', 0),
            "bowler": data.get('bowler', 'Manual Entry'),
            "match_id": data.get('match_id'),
            "source": "manual"
        })

        # Save to dedicated performance logs
        db.performances.insert_one(data)
        
        # Auto-register athlete node if missing
        db.players.update_one(
            {"name": data.get('name', data.get('player'))},
            {"$set": {"name": data.get('name', data.get('player')), "role": "Athlete"}},
            upsert=True
        )
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DATA INGESTION ENGINE ---
@app.route("/import-dataset", methods=["POST"])
def import_dataset():
    global current_tournament
    if 'file' not in request.files: return jsonify({"error": "No file stream"}), 400
    file = request.files['file']
    current_tournament = file.filename.replace('_', ' ').replace('.csv', '').upper()
    
    try:
        df = pd.read_csv(file, low_memory=False)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        df = df.replace('-', '0')
        
        mapping = {
            'match_id': ['match_id', 'id', 'game_id', 'match_no'],
            'over': ['over', 'ball', 'ball_no', 'delivery'],
            'player': ['player', 'striker', 'batsman', 'batter', 'name'],
            'runs': ['runs', 'runs_off_bat', 'batsman_runs', 'score', 'r'],
            'team': ['batting_team', 'team', 'country', 'team_name'],
            'bowler': ['bowler', 'bowling']
        }
        
        final_cols = {alias: target for target, aliases in mapping.items() for alias in aliases if alias in df.columns}
        df.rename(columns=final_cols, inplace=True)
        if 'player' in df.columns: df = df.dropna(subset=['player'])
        
        for col in ['runs', 'match_id']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
        records = df.to_dict('records')
        db.raw_match_data.delete_many({}) 
        db.raw_match_data.insert_many(records)

        players_to_upsert = []
        for p_name in df['player'].unique():
            if pd.isna(p_name): continue
            players_to_upsert.append(UpdateOne(
                {"name": str(p_name)},
                {"$set": {"name": str(p_name), "role": "Athlete"}},
                upsert=True
            ))
        if players_to_upsert:
            db.players.bulk_write(players_to_upsert)

        return jsonify({"status": "success", "data": {"count": len(df), "tournament": current_tournament}})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- ANALYTICS UPLINK ---
@app.route("/dashboard-all", methods=["GET"])
def dashboard_all():
    try:
        global current_tournament
        pipeline = [
            {"$group": {
                "_id": "$player",
                "total_runs": {"$sum": "$runs"},
                "balls_faced": {"$sum": 1},
                "team": {"$first": "$team"}
            }},
            {"$sort": {"total_runs": -1}}
        ]
        results = list(db.raw_match_data.aggregate(pipeline))
        
        res = []
        for r in results:
            runs = int(r.get("total_runs", 0))
            balls = int(r.get("balls_faced", 1))
            sr = (runs / balls * 100) if balls > 0 else 0
            res.append({
                "name": r["_id"], 
                "team": r.get("team", "International"), 
                "batting": {
                    "runs": runs, 
                    "sr": round(sr, 2)
                }
            })
        
        return jsonify({"status": "success", "data": res, "tournament_name": current_tournament})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DEEP INTELLIGENCE ---
@app.route("/player-intelligence/<path:identifier>", methods=["GET"])
def player_intel(identifier):
    decoded_val = urllib.parse.unquote(identifier).strip()
    safe_search = re.escape(decoded_val)
    
    player_node = db.players.find_one({"name": {"$regex": f"^{safe_search}$", "$options": "i"}})
    actual_name = player_node['name'] if player_node else decoded_val

    phase_pipeline = [
        {"$match": {"player": {"$regex": f"^{re.escape(actual_name)}$", "$options": "i"}}},
        {"$addFields": {"over_num": {"$toDouble": "$over"}}},
        {"$project": {
            "runs": 1,
            "phase": {
                "$cond": [ {"$lt": ["$over_num", 6]}, "Powerplay", 
                {"$cond": [ {"$lt": ["$over_num", 15]}, "Middle", "Death"]}]
            }
        }},
        {"$group": {"_id": "$phase", "runs": {"$sum": "$runs"}, "balls": {"$sum": 1}}}
    ]
    phases = list(db.raw_match_data.aggregate(phase_pipeline))
    phase_performance = [{"phase": p["_id"], "runs": p["runs"], "balls": p["balls"], "sr": round(p["runs"]/p["balls"]*100, 2) if p["balls"] > 0 else 0} for p in phases]

    matchup_pipeline = [
        {"$match": {"player": {"$regex": f"^{re.escape(actual_name)}$", "$options": "i"}}},
        {"$group": {"_id": "$bowler", "runs": {"$sum": "$runs"}}},
        {"$sort": {"runs": -1}},
        {"$limit": 5}
    ]
    matchups = list(db.raw_match_data.aggregate(matchup_pipeline))
    best_matchups = [{"bowler": m["_id"], "runs": m["runs"]} for m in matchups]

    return jsonify({
        "status": "success", 
        "data": {
            "name": actual_name, 
            "phase_performance": phase_performance, 
            "best_matchups": best_matchups
        }
    })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/reset-all", methods=["DELETE"])
def reset():
    for coll in ["players", "performances", "raw_match_data", "matches"]:
        db[coll].delete_many({})
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)  