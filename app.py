from flask import Flask, jsonify, render_template
import psycopg2
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "mecum_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "vademecum"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )
    return conn

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/api/laws/<int:law_id>', methods=['GET'])
def get_law(law_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
        WITH RECURSIVE section_tree AS (
            SELECT
                s.id,
                s.law_id,
                s.parent_id,
                s.type,
                s.identifier,
                s.content,
                s.display_order,
                1 AS depth,
                LPAD(s.display_order::text, 2, '0') AS path
            FROM sections s
            WHERE s.law_id = %s AND s.parent_id IS NULL

            UNION ALL

            SELECT
                s.id,
                s.law_id,
                s.parent_id,
                s.type,
                s.identifier,
                s.content,
                s.display_order,
                st.depth + 1,
                st.path || '.' || LPAD(s.display_order::text, 2, '0') AS path
            FROM sections s
            JOIN section_tree st ON s.parent_id = st.id
            WHERE s.law_id = %s
        )
        SELECT l.name, st.type, st.identifier, st.content, st.path
        FROM laws l
        JOIN section_tree st ON l.id = st.law_id
        WHERE l.id = %s
        ORDER BY st.path;
        """, (law_id, law_id, law_id))

        result = cur.fetchall()
    except psycopg2.Error as e:
        print(f"Erro na consulta SQL: {e}")
        return jsonify({"error": "Erro no servidor"}), 500
    finally:
        cur.close()
        conn.close()

    if result:
        law = {
            "name": result[0][0],
            "sections": []
        }
        for row in result:
            section_type = row[1]
            identifier = row[2]
            content = row[3]
            path = row[4]
            if content:
                law['sections'].append({
                    "type": section_type,
                    "identifier": identifier,
                    "content": content,
                    "path": path
                })
        return jsonify(law)
    else:
        return jsonify({"error": "Lei não encontrada"}), 404

if __name__ == "__main__":
    app.run(debug=True)
