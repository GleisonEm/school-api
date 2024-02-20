const db = require("../models");
const moment = require('moment-timezone');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Joker = require("../models/Joker");

const { jsPDF } = require("jspdf");
const autoTable = require('jspdf-autotable');


const ReportController = {
    async getDataTeacher(req, res) {
        try {
            // Executar a consulta SQL
            let querySql = `SELECT u.name AS professor_name, t.id AS teacher_id, t.code AS code_teacher, s.name AS subject_name, c.id as class_id, c.class_name, tc.entry_datetime, tc.exit_datetime, tc.total_hours_worked FROM time_control tc JOIN teachers t ON tc.teacher_id = t.id JOIN users u ON t.user_id = u.id JOIN classes c ON tc.class_id = c.id JOIN subjects s ON tc.subject_id = s.id WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE())`;

            if (req.query.professor_id) {
                console.log('entrei aq')
                querySql += ` AND t.id = ${parseInt(req.query.professor_id)}`
            }

            if (req.query.class_id) {
                console.log('entrei aq')
                querySql += ` AND c.id = ${parseInt(req.query.class_id)}`
            }

            querySql += ' ORDER BY tc.entry_datetime';

            const results = await Joker.query(querySql);

            if (!results || results.length === 0) {
                return res.status(204).send({ results: [] });
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
    async getDataStudent(req, res) {
        try {
            // Executar a consulta SQL
            // let querySql = `
            //     SELECT
            //     u.name AS student_name,
            //     s.id AS student_id,
            //     sb.name AS subject_name,
            //     c.id as class_id,
            //     c.class_name,
            //     tc.entry_datetime,
            //     tc.exit_datetime,
            //     tc.total_hours_worked
            //     FROM time_control tc
            //     JOIN attendance_records ar ON ar.time_control_id = tc.id
            //     JOIN students s ON s.id = ar.student_id
            //     JOIN users u ON s.user_id = u.id
            //     JOIN classes c ON tc.class_id = c.id
            //     JOIN subjects sb ON tc.subject_id = s.id
            //     WHERE MONTH(tc.entry_datetime) = MONTH(CURRENT_DATE()) AND YEAR(tc.entry_datetime) = YEAR(CURRENT_DATE())`;
            let querySql = `SELECT
                ar.id as attendance_id,
                s.id AS student_id,
                u.name AS student_name,
                sub.name AS subject_name,
                ar.date AS attendance_date,
                ar.attendance_status,
                ar.time_control_id as time_control_id,
                tc.entry_datetime, tc.exit_datetime, tc.total_hours_worked,
                ut.name as teacher_name,
                c.class_name as class_name
            FROM
                attendance_records ar
            JOIN students s ON ar.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN time_control tc ON ar.time_control_id = tc.id
            JOIN subjects sub ON tc.subject_id = sub.id
            JOIN classes c ON tc.class_id = c.id
            JOIN shifts sh ON c.shift_id = sh.id
            JOIN teachers t ON tc.teacher_id = t.id
            JOIN users ut ON t.user_id = ut.id

            `
            // if (req.query.professor_id) {
            //     console.log('entrei aq')
            //     querySql += ` AND t.id = ${parseInt(req.query.professor_id)}`
            // }

            if (req.query.teacher_id) {
                console.log('entrei aq')
                querySql += ` WHERE t.id = ${parseInt(req.query.teacher_id)}`
            }

            querySql += ' ORDER BY sub.name ASC, u.name ASC';

            const results = await Joker.query(querySql);
            // res.send(results)
            if (!results || results.length === 0) {
                return res.status(200).send({ results: [] });
            }

            // const formattedResults = results.map(record => {
            //     const formattedEntryDatetime = moment(record.entry_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
            //     const formattedExitDatetime = moment(record.exit_datetime).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
            //     return { ...record, entry_datetime: formattedEntryDatetime, exit_datetime: formattedExitDatetime };
            // });
            const groupedResults = results.reduce((acc, record) => {
                const { time_control_id, subject_name, ...rest } = record;
                const formattedEntryDatetime = moment(record.entry_datetime, 'DD/MM/YYYY HH:mm:ss').tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
                const formattedExitDatetime = moment(record.exit_datetime, 'DD/MM/YYYY HH:mm:ss').tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

                const resultEntry = { ...rest, entry_datetime: formattedEntryDatetime, exit_datetime: formattedExitDatetime };

                if (!acc[time_control_id]) {
                    acc[time_control_id] = {};
                }

                if (!acc[time_control_id][subject_name]) {
                    acc[time_control_id][subject_name] = [];
                }

                acc[time_control_id][subject_name].push(resultEntry);

                return acc;
            }, {});

            const formattedResults = Object.entries(groupedResults).flatMap(([time_control_id, subjects]) => {
                return Object.entries(subjects).map(([subject_name, records]) => {
                    const entryDatetime = moment(records[0].entry_datetime, 'DD/MM/YYYY HH:mm:ss').tz('America/Sao_Paulo').format('HH:mm'); // Assume que todas as entradas terão o mesmo horário de entrada
                    const exitDatetime =
                     moment(records[0].exit_datetime, 'DD/MM/YYYY HH:mm:ss').tz('America/Sao_Paulo').format('HH:mm'); // Assume que todas as entradas terão o mesmo horário de saída
                    const totalHoursWorked = records.reduce((acc, cur) => acc + parseFloat(cur.total_hours_worked), 0);
                    const teacherName = records[0].teacher_name
                    const day = records[0].attendance_date
                    const className =  records[0].class_name

                    return {
                        time_control_id: parseInt(time_control_id),
                        subject_name,
                        entry_datetime: entryDatetime,
                        exit_datetime: exitDatetime,
                        class_name: className,
                        total_hours: totalHoursWorked.toFixed(2),
                        day: day,
                        teacher_name: teacherName,
                        results: records
                    };
                });
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
