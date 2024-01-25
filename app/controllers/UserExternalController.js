const db = require("../models");
const Photo = db.photos;
const Op = db.Sequelize.Op;
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const moment = require("moment-timezone");
const fetch = require("isomorphic-fetch");
const AdmZip = require("adm-zip");

// Define o fuso horário para 'America/Sao_Paulo' (Brasília)
moment.tz.setDefault("America/Sao_Paulo");
const { v4: uuidv4 } = require("uuid");

aws.config.update({
  accessKeyId: "DO009GNNZFNGXDL3K8BQ",
  secretAccessKey: "EEMDV/JD/AEvYKpXNBjdIi3aQCuPf7Lb33gwn8lyW2Y",
});

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});
const bucket = "geea-storage";
const bucketFolder = "boticario-tmj/";
const zipFilename = "photos.zip";

const downloadPhoto = (url) => {
  return fetch(url).then((response) => {
    return response.buffer();
  });
};

const downloadAndZipPhotos = (photoLinks) => {
  console.log("QUANTIDADE DE FOTOS", photoLinks.length);
  const downloadPromises = photoLinks.map((photo, index) => {
    return downloadPhoto(photo.link).then((photoBuffer) => {
      console.log(`Downloaded photo ${index + 1}`);
      return {
        buffer: photoBuffer,
        name: photo.name,
      };
    });
  });

  return Promise.all(downloadPromises).then((downloadedPhotos) => {
    const zip = new AdmZip();
    console.log("criando zip......");
    downloadedPhotos.forEach((photo, index) => {
      console.log("zipando: ", index);
      zip.addFile(photo.name, photo.buffer);
    });
    console.log("zip finished");
    const zipBuffer = zip.toBuffer();
    return zipBuffer;
  });
};

exports.getZipPhotos = (req, res) => {
  const date = req.query.date;

  const initialDate = date + " 15:00:00";

  // Data final às 01:00:00 do dia seguinte
  const finalDate = moment
    .tz(date, "YYYY-MM-DD", "America/Sao_Paulo")
    .add(1, "day")
    .format("YYYY-MM-DD");

  const formattedInitialDate = moment
    .utc(initialDate)
    .local()
    .format("YYYY-MM-DD HH:mm:ss");
  const formattedFinalDate = moment
    .utc(finalDate + " 01:00:00")
    .local()
    .format("YYYY-MM-DD HH:mm:ss");

  Photo.findAll({
    where: {
      created_at: {
        [Op.gte]: formattedInitialDate,
        [Op.lte]: formattedFinalDate,
        // [Op.lte]: formattedDate,
      },
    },
  })
    .then((data) => {
      let photos = data.map((photo) => {
        return {
          name: photo.link,
          link: photo.link
            ? `${process.env.BUCKET_URL}/${bucketFolder}${photo.link}`
            : null,
        };
      });

      return downloadAndZipPhotos(photos)
        .then((zipBuffer) => {
          res.set("Content-Disposition", "attachment; filename=photos.zip");
          res.set("Content-Type", "application/zip");
          res.send(zipBuffer);
        })
        .catch((error) => {
          console.error("Error:", error);
          return res.status(500).send("Internal Server Error");
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao obter a lita de photos",
      });
    });
};

exports.report = async (req, res) => {
  const date = req.query.date;

  const initialDate = date + " 15:00:00";

  // Data final às 01:00:00 do dia seguinte
  const finalDate = moment
    .tz(date, "YYYY-MM-DD", "America/Sao_Paulo")
    .add(1, "day")
    .format("YYYY-MM-DD");

  const formattedInitialDate = moment
    .utc(initialDate)
    .local()
    .format("YYYY-MM-DD HH:mm:ss");
  const formattedFinalDate = moment
    .utc(finalDate + " 01:00:00")
    .local()
    .format("YYYY-MM-DD HH:mm:ss");

  const queries = [
    Photo.count({
      where: {
        created_at: {
          [Op.gte]: formattedInitialDate,
          [Op.lte]: formattedFinalDate,
          // [Op.lte]: formattedDate,
        },
      },
    }),
  ];

  // Executar as queries em paralelo
  Promise.all(queries)
    .then((results) => {
      const [countPhotos] = results;

      return res.send({
        countPhotos: countPhotos,
      });
    })
    .catch((error) => {
      console.log("Erro:", error);
      return res.status(400).send({
        message: "Erro ao recuperar os dados do relatorio",
      });
    });
};

const makeListPhoto = (data) => {
  return data.map((photo) => {
    return formatPhoto(photo);
  });
};

const formatPhoto = (data) => {
  return {
    id: data.dataValues.id,
    photoLink: data.link
      ? `${process.env.BUCKET_URL}/${bucketFolder}${data.link}`
      : null,
  };
};

// const formatListManagerUser = (data) => {
//   return data.map((user) => {
//     const { date, time } = formatDateTime(user.created_at);

//     return {
//       id: user.dataValues.id,
//       name: user.name,
//       email: user.email,
//       cellphone: user.cellphone,
//       city: user.city,
//       responseQuestion: user.question_difference_sj,
//       videoName: user.video,
//       videoLink: user.video
//         ? `${process.env.BUCKET_URL}/${bucketFolder}${user.video}`
//         : null,
//       statusSend: statusTranslations[user.status_send],
//       date: date,
//       time: time,
//     };
//   });
// };
// const downloadPhoto = (url, filename) => {
//   return fetch(url)
//     .then((response) => {
//       const fileStream = fs.createWriteStream(filename);
//       response.body.pipe(fileStream);
//       return new Promise((resolve, reject) => {
//         fileStream.on('finish', resolve);
//         fileStream.on('error', reject);
//       });
//     });
// };
// const downloadAndZipPhotos = (photoLinks, zipFilename, res) => {
//   const downloadPromises = photoLinks.map((link, index) => {
//     const filename = `photo${index + 1}.png`;
//     return downloadPhoto(link, filename)
//       .then(() => {
//         console.log(`Downloaded photo ${index + 1}`);
//         return filename;
//       });
//   });

//   Promise.all(downloadPromises)
//     .then((downloadedPhotos) => {
//       console.log('estou aqui');
//       const zip = new AdmZip();
//       downloadedPhotos.forEach((photo) => {
//         zip.addLocalFile(photo);
//       });
//       zip.writeZip(zipFilename);
//       console.log(`All photos downloaded and zipped to ${zipFilename}`);
//     });
// };

// Exemplo de uso
