# utils/pdf_generator.py

import os
import requests
from fpdf import FPDF
from PIL import Image  # Import PIL to get image dimensions

def generate_pdf(event_name, bills, uploads_folder):
    pdf = FPDF()
    print(event_name)
    print(bills)
    print(uploads_folder)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.add_font('Montserrat', '', os.path.join('fonts', 'Montserrat-Medium.ttf'), uni=True)
    pdf.add_font('Montserrat', 'B', os.path.join('fonts', 'Montserrat-Bold.ttf'), uni=True)
    
    pdf.set_font("Montserrat", 'B', 16)
    pdf.cell(0, 10, event_name, ln=True, align='C')
    
    # Table Headers
    pdf.set_font("Montserrat", 'B', 12)
    line_height = pdf.font_size * 2
    col_widths = [30, 100, 40]  # S.No., Name, Amount
    pdf.ln(10)
    pdf.set_x(20)
    headers = ['S.No.', 'Name', 'Amount']
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], line_height, header, border=1, align='C')
    pdf.ln(line_height)

    # Table Rows
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Montserrat", '', 12)
    for idx, bill in enumerate(bills, start=1):
        pdf.set_x(20)
        pdf.cell(col_widths[0], line_height, str(idx), border=1, align='C')
        pdf.cell(col_widths[1], line_height, bill['billName'], border=1, align='C')
        pdf.cell(col_widths[2], line_height, str(bill['amount']), border=1, align='C')
        pdf.ln(line_height)
    
    # Adding Images
    c = 1
    for bill in bills:
        # Process images1
        if 'images1' in bill and bill['images1']:
            pdf.add_page()
            pdf.set_font("Montserrat", 'B', 14)
            pdf.cell(0, 10, f"{bill['billName']} - Images 1", ln=True)
            pdf.ln(10)
            add_images_horizontally(
                pdf,
                bill['images1'],
                uploads_folder,
                f"Bill {c}: {bill['billName']} - Images 1 (contd.)",
                scale_factor=1.0  # Default scale
            )
        
        # Process images2
        if 'images2' in bill and bill['images2']:
            pdf.add_page()
            pdf.set_font("Montserrat", 'B', 14)
            pdf.cell(0, 10, f"{bill['billName']} - Images 2", ln=True)
            pdf.ln(10)
            add_images_horizontally(
                pdf,
                bill['images2'],
                uploads_folder,
                f"Bill {c}: {bill['billName']} - Images 2 (contd.)",
                scale_factor=1.5  # Scale images by 1.5
            )
        c += 1

    return pdf

def add_images_horizontally(pdf, image_names, uploads_folder, continuation_title, scale_factor=1.0):
    from PIL import Image  # Import PIL to get image dimensions
    
    x_start = pdf.l_margin
    y_start = pdf.get_y()
    x = x_start
    y = y_start
    max_y = y

    for image_name in image_names:
        image_url = f"http://localhost:5081/getImage/{image_name}"
        image_path = download_image(image_url, uploads_folder)
        if image_path:
            # Open image to get dimensions
            with Image.open(image_path) as img:
                orig_width, orig_height = img.size
            # Assuming fixed base height
            base_image_height = 100  # mm, adjust as needed
            # Apply scale factor
            image_height = base_image_height * scale_factor
            # Calculate scaled width to maintain aspect ratio
            image_width = (orig_width / orig_height) * image_height

            # Check if the image fits horizontally
            if x + image_width > pdf.w - pdf.r_margin:
                # Move to next line
                x = x_start
                y = max_y + 5  # Add vertical spacing
                if y + image_height > pdf.h - pdf.b_margin:
                    # Add new page if vertical space is exceeded
                    pdf.add_page()
                    pdf.set_font("Montserrat", 'B', 14)
                    pdf.cell(0, 10, continuation_title, ln=True)
                    pdf.ln(10)
                    y = pdf.get_y()
                    max_y = y
                else:
                    max_y = y
            # Add image to PDF
            pdf.image(image_path, x=x, y=y, w=image_width, h=image_height)
            x += image_width + 5  # Move x for next image, add horizontal spacing
            max_y = max(max_y, y + image_height)
            # Remove the downloaded image file to save space

def download_image(url, uploads_folder):
    try:
        response = requests.get(url)
        response.raise_for_status()
        image_name = url.split('/')[-1]
        image_path = os.path.join(uploads_folder, image_name)
        with open(image_path, 'wb') as f:
            f.write(response.content)
        return image_path
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image {url}: {e}")
        return None
