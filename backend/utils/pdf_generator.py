import os
import requests
from fpdf import FPDF
from PIL import Image  # Import PIL to get image dimensions

def generate_pdf(event_name, bills, uploads_folder):
    pdf = FPDF()
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
    for c, bill in enumerate(bills, start=1):
        # Process images1
        if 'images1' in bill and bill['images1']:
            add_images_one_per_page(
                pdf,
                bill['images1'],
                uploads_folder,
                f"Bill {c}: {bill['billName']} - Invoice",
                scale_factor=1.0
            )

        # Process images2
        if 'images2' in bill and bill['images2']:
            add_images_one_per_page(
                pdf,
                bill['images2'],
                uploads_folder,
                f"Bill {c}: {bill['billName']} - Proof of Payment",
            )
    return pdf

def add_images_one_per_page(pdf, image_names, uploads_folder, title, scale_factor=1.0):
    for idx, image_name in enumerate(image_names, start=1):
        image_url = f"http://localhost:5081/getImage/{image_name}"
        image_path = download_image(image_url, uploads_folder)
        if image_path:
            # Open image to get dimensions
            with Image.open(image_path) as img:
                orig_width, orig_height = img.size

            # Set maximum dimensions considering margins and scale factor
            max_width = (pdf.w - pdf.l_margin - pdf.r_margin) * scale_factor
            max_height = (pdf.h - pdf.t_margin - pdf.b_margin - 20) * scale_factor  # Leave space for title

            # Calculate scaled dimensions to maintain aspect ratio
            aspect_ratio = orig_width / orig_height
            if (max_width / aspect_ratio) <= max_height:
                image_width = max_width
                image_height = image_width / aspect_ratio
            else:
                image_height = max_height
                image_width = image_height * aspect_ratio

            # Add new page and set title
            pdf.add_page()
            pdf.set_font("Montserrat", 'B', 14)
            pdf.cell(0, 10, f"{title} - Image {idx}", ln=True)
            pdf.ln(10)

            # Center image on page
            x = (pdf.w - image_width) / 2
            y = pdf.get_y()
            pdf.image(image_path, x=x, y=y, w=image_width, h=image_height)

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
