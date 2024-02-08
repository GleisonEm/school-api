const db = require("../models");
const moment = require('moment-timezone');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Joker = require("../models/Joker");


const ReportController = {
    async getData(req, res) {
        try {
            // Executar a consulta SQL
            const results = await Joker.query('SELECT u.name AS professor_name, s.name AS subject_name, c.class_name, tc.entry_datetime FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE()) ORDER BY tc.entry_datetime');

            if (!results || results.length === 0) {
                return res.status(404).send('No records found');
            }

            const formattedResults = results.map(record => {
                const formattedEntryDatetime = moment(record.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
                return { ...record, entry_datetime: formattedEntryDatetime };
            });

            res.send({ results: formattedResults })
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    async download() {
        try {
            // Executar a consulta SQL
            const results = await Joker.query('SELECT u.name AS professor_name, s.name AS subject_name, c.class_name, tc.entry_datetime FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE()) ORDER BY tc.entry_datetime');

            if (!results || results.length === 0) {
                return res.status(404).send('No records found');
            }

            // Criar um PDF
            const doc = new PDFDocument();
            const fileName = `report-${Date.now()}.pdf`;
            const filePath = `${__dirname}/${fileName}`;
            doc.pipe(fs.createWriteStream(filePath));

            // Adicionar conteúdo ao PDF
            results.forEach(record => {
                doc.text(`Professor: ${record.professor_name} - Matéria: ${record.subject_name} - Turma: ${record.class_name} - Hora de Entrada: ${record.entry_datetime}`);
                doc.moveDown();
            });

            doc.end();

            // Enviar o arquivo para download
            doc.on('finish', () => {
                res.download(filePath, fileName, (err) => {
                    if (!err) {
                        // Apagar o arquivo após o download
                        fs.unlinkSync(filePath);
                    }
                });
            });
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = ReportController;
