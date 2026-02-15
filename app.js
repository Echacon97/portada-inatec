const { jsPDF } = window.jspdf;

// Establece la fecha actual en el campo de fecha del formulario
document.querySelector("#fecha").valueAsDate = new Date();

/**
 * Clase PDFGenerator
 *
 * Esta clase encapsula toda la lógica para generar un PDF con jsPDF.
 * Incluye métodos para manejar imágenes, formatear fechas y escribir texto centrado en el documento.
 */
class PDFGenerator {
  constructor() {
    // Inicializa un nuevo documento PDF con formato de carta (letter) y unidades en píxeles (px)
    this.doc = new jsPDF({ unit: "px", format: "letter" });
    this.pageWidth = this.doc.internal.pageSize.width; // Ancho de la página
    this.UNI_LOGO_SRC = "uni_logo.png"; // Ruta de la imagen del logo de la universidad
  }

  /**
   * Carga el logo de la universidad y lo convierte en un string Base64.
   * @returns {Promise<string>} - Una promesa que se resuelve con la cadena Base64 de la imagen.
   */
  async loadUniLogo() {
    const img = new Image();
    img.src = this.UNI_LOGO_SRC;
    await img.decode(); // Espera a que la imagen se cargue completamente
    return this.imageToBase64(img);
  }

  /**
   * Convierte una imagen en un string Base64 usando un elemento canvas.
   * @param {HTMLImageElement} img - La imagen a convertir.
   * @returns {string} - La imagen convertida en Base64.
   */
  imageToBase64(img) {
    const canvas = document.createElement("CANVAS");
    const ctx = canvas.getContext("2d");
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  /**
   * Convierte una fecha en formato YYYY-MM-DD a una fecha en lenguaje natural.
   * @param {string} dateStr - La fecha en formato YYYY-MM-DD.
   * @returns {string} - La fecha en lenguaje natural, por ejemplo, "17 de agosto de 2024".
   */
  getNaturalDate(dateStr) {
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const [year, month, day] = dateStr.split("-");
    return `${day} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  }

  /**
   * Escribe un texto centrado horizontalmente en el PDF.
   * @param {string} text - El texto a escribir.
   * @param {number} y - La posición vertical (eje y) donde se escribirá el texto.
   */
  writeCenteredText(text, y) {
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2; // Calcula la posición X para centrar el texto
    this.doc.text(text, x, y);
  }

  /**
   * Genera el documento PDF con toda la información proporcionada por el usuario.
   */
  async generate() {
    let line = 40; // Posición inicial en Y
    const date = this.getNaturalDate(document.querySelector("#fecha").value);
    const location = document.querySelector("#lugar").value;
    const faculty = document.querySelector("#facultad").value;
    const career = document.querySelector("#carrera").value;
    const classroom = document.querySelector("#clase").value;
    const homework = document.querySelector("#tarea").value.split("\n");
    const teacher = document.querySelector("#docente").value;
    const students = document.querySelector("#estudiantes").value.split("\n");

    // Configuración del texto y escritura de encabezados
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(20);
    this.writeCenteredText("UNIVERSIDAD NACIONAL DE INGENIERIA", line);
    line += 20;
    this.writeCenteredText(faculty, line);
    line += 20;
    this.writeCenteredText(career, line);
    line += 40;

    // Inserta el logo de la universidad
    const logoBase64 = await this.loadUniLogo();
    this.doc.addImage(
      logoBase64,
      "PNG",
      (this.pageWidth - 120) / 2,
      line,
      120,
      77
    );
    line = 260;

    // Configuración de la clase y tarea
    this.doc.setFontSize(18);
    this.writeCenteredText(classroom, line);
    this.doc.setFont("times", "italic");
    line += 20;
    homework.forEach((homeworkLine) => {
      this.writeCenteredText(homeworkLine, line);
      line += 16;
    });
    line += 40;

    // Escribe los estudiantes y docente
    this.doc.setFont("times", "bold");
    this.writeCenteredText("Elaborado por:", line);
    line += 20;
    this.doc.setFont("times", "normal");
    students.forEach((student) => {
      this.writeCenteredText(student, line);
      line += 16;
    });
    line += 20;

    this.doc.setFont("times", "bold");
    this.writeCenteredText("Docente:", line);
    line += 20;
    this.doc.setFont("times", "normal");
    this.writeCenteredText(teacher, line);

    // Escribe la ubicación y la fecha
    line = 540;
    this.doc.setFont("times", "italic");
    this.writeCenteredText(location, line);
    line += 16;
    this.writeCenteredText(date, line);

    // Guarda el documento PDF
    this.doc.save("documento.pdf");
  }
}

// Inicializa el generador de PDF y agrega un evento para generar el PDF al hacer clic en el botón
document.querySelector("#generarPDF").addEventListener("click", () => {
  const pdfGen = new PDFGenerator();
  pdfGen.generate();
});
