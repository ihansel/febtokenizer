import PyPDF2

def extract_text_from_pdf(pdf_path, output_path=None):
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        
        # Get the number of pages
        num_pages = len(pdf_reader.pages)
        print(f"Total pages: {num_pages}")
        
        # Extract text from each page
        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n\n"
        
        # Save to file if output path is provided
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(text)
            print(f"Text saved to {output_path}")
        
        return text

if __name__ == "__main__":
    pdf_path = "Agents - Getting Started.pdf"
    output_path = "pdf_content.txt"
    extract_text_from_pdf(pdf_path, output_path) 