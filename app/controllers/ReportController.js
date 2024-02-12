const db = require("../models");
const moment = require('moment-timezone');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Joker = require("../models/Joker");

const { jsPDF } = require("jspdf");
const autoTable = require('jspdf-autotable');


const ReportController = {
    async getData(req, res) {
        try {
            // Executar a consulta SQL
            const results = await Joker.query('SELECT u.name AS professor_name, t.code AS code_teacher, s.name AS subject_name, c.class_name, tc.entry_datetime, tc.exit_datetime, tc.total_hours_worked FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE()) ORDER BY tc.entry_datetime');

            if (!results || results.length === 0) {
                return res.status(404).send('No records found');
            }

            const formattedResults = results.map(record => {
                const formattedEntryDatetime = moment(record.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
                 const formattedExitDatetime = moment(record.exit_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
                return { ...record, entry_datetime: formattedEntryDatetime, exit_datetime: formattedExitDatetime };
            });

            res.send({ results: formattedResults })
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    async download(req, res) {
            try {
                // Executar a consulta SQL
                const results = await Joker.query('SELECT u.name AS professor_name, s.name AS subject_name, c.class_name, tc.entry_datetime FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE()) ORDER BY tc.entry_datetime');

                if (!results || results.length === 0) {
                    return res.status(404).send('No records found');
                }

                // Criar um PDF
                const doc = new jsPDF();

                // Adicionar cabeçalhos da tabela
                const headers = [["Professor", "Matéria", "Turma", "Hora de Entrada"]];

                // Adicionar linhas da tabela
                const body = results.map(record => [
                    record.professor_name,
                    record.subject_name,
                    record.class_name,
                    moment(record.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')
                ]);

                // Configurar AutoTable
                autoTable(doc, {
                    head: headers,
                    body: body,
                    theme: 'striped',
                    didDrawPage: (data) => {
                        doc.text("Relatório de Entradas", data.settings.margin.left, 10);
                    }
                });

                // Salvar o PDF em um arquivo
                const fileName = `report-${Date.now()}.pdf`;
                const filePath = `${__dirname}/${fileName}`;
                doc.save(filePath);

                // Enviar o arquivo para download
                return res.download(filePath, fileName, (err) => {
                    if (err) {
                        console.error('Erro ao enviar o arquivo:', err);
                        return res.status(500).send('Erro ao enviar o arquivo');
                    }

                    // Apagar o arquivo após o download
                    fs.unlinkSync(filePath);
                });
            } catch (error) {
                console.error('Erro ao gerar o relatório:', error);
                return res.status(500).send('Erro interno do servidor');
            }
        }
    // async download(req, res) {
    //     try {
    //         // Executar a consulta SQL
    //         const results = await Joker.query('SELECT u.name AS professor_name, s.name AS subject_name, c.class_name, tc.entry_datetime FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE()) ORDER BY tc.entry_datetime');

    //         if (!results || results.length === 0) {
    //             return res.status(404).send('No records found');
    //         }

    //         // Criar um PDF
    //         const doc = new PDFDocument();
    //         const fileName = `report-${Date.now()}.pdf`;
    //         const filePath = `${__dirname}/${fileName}`;
    //         const stream = doc.pipe(fs.createWriteStream(filePath));
    //         console.log(filePath)
    //         // Adicionar conteúdo ao PDF

    //         const headers = ["Professor", "Matéria", "Turma", "Hora de Entrada"];

    //         // Função para adicionar uma linha de texto
    //         function addTableRow(doc, row) {
    //             row.forEach((text, i) => {
    //                 doc.text(text, 100 + i * 150, doc.y, { width: 140, align: 'left' });
    //             });
    //             doc.moveDown(1.5); // Move para a próxima linha
    //         }

    //         // Adicionar cabeçalhos
    //         addTableRow(doc, headers);

    //         // Adicionar linhas da tabela
    //         results.forEach(record => {
    //             const row = [
    //                 record.professor_name,
    //                 record.subject_name,
    //                 record.class_name,
    //                 moment(record.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')
    //             ];
    //             addTableRow(doc, row);
    //         });

    //         // Finalizar a criação do PDF
    //         doc.end();

    //         // Evento 'finish' é acionado quando a escrita no documento é concluída
    //         stream.on('finish', () => {
    //             console.log('PDF gerado com sucesso, iniciando download');

    //             // Enviar o arquivo para download
    //             res.download(filePath, fileName, (err) => {
    //                 if (err) {
    //                     console.error('Erro ao enviar o arquivo:', err);
    //                     return res.status(500).send('Erro ao enviar o arquivo');
    //                 }

    //                 // Apagar o arquivo após o download
    //                 fs.unlinkSync(filePath);
    //                 console.log('Arquivo excluído com sucesso');
    //             });
    //         });

    //         // Escrever o PDF em um arquivo
    //         doc.pipe(fs.createWriteStream(filePath));
    //     } catch (error) {
    //         console.error('Error generating report:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // }
};

    module.exports = ReportController;
