# app.py

from flask import Flask, send_file, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import os
from utils.pdf_generator import generate_pdf
from io import BytesIO
from flask_cors import CORS

# app = Flask(__name__)
# Load environment variables
load_dotenv()

app = Flask(__name__)

CORS(app)
# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'collegeEventsDB')
UPLOADS_FOLDER = os.getenv('UPLOADS_FOLDER', 'uploads')

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Ensure uploads folder exists
if not os.path.exists(UPLOADS_FOLDER):
    os.makedirs(UPLOADS_FOLDER)

@app.route('/download/<event_name>', methods=['GET'])
def download_pdf(event_name):
    try:
        # Fetch all bills from the collection named after event_name
        collection = db[event_name]
        bills = list(collection.find({}))
        if not bills:
            return jsonify({"msg": "No bills found for this event."}), 404
        print(bills)
        # Prepare data for PDF
        formatted_bills = []
        print("Bills",bills)
        for bill in bills:
            if not bill.get("isAvailable", False):
                continue
            formatted_bills.append({
                "billName": bill.get("billName", "N/A"),
                "description": bill.get("description", "N/A"),
                "amount": bill.get("amount", 0),
                "images1": bill.get("images1", ""),
                "images2": bill.get("images2", "")
            })

        print("get ")
        # Generate PDF
        pdf = generate_pdf(event_name, formatted_bills, UPLOADS_FOLDER)
        print("PDF generated")
        # Save PDF to a BytesIO buffer
        pdf_buffer = BytesIO()
        pdf.output(pdf_buffer)
        pdf_buffer.seek(0)

        # Send the PDF as a downloadable file
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"{event_name}_bills.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({"msg": "Internal server error."}), 500
# app.py

@app.route('/getImage/<image_name>', methods=['GET'])
def get_image(image_name):
    print(image_name)
    try:
        image_path = os.path.join(UPLOADS_FOLDER, image_name)
        if not os.path.exists(image_path):
            return jsonify({"msg": "Image not found."}), 404

        # Determine MIME type based on file extension
        ext = os.path.splitext(image_name)[1].lower()
        if ext == '.png':
            mimetype = 'image/png'
        elif ext in ['.jpg', '.jpeg']:
            mimetype = 'image/jpeg'
        else:
            mimetype = 'application/octet-stream'  # Default fallback

        return send_file(image_path, mimetype=mimetype)
    except Exception as e:
        print(f"Error fetching image {image_name}: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    
    
@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "OK"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5081, debug=True)
