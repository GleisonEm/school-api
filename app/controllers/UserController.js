const db = require("../models");
const Photo = db.photos;
const Op = db.Sequelize.Op;
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
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

// Create and Save a new Tutorial
exports.UploadPhoto = (request, response) => {
  const uuid = uuidv4();
  const photoName = `${uuid}.png`;
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
      acl: "public-read",
      key: function (request, file, cb) {
        console.log(file);
        cb(null, bucketFolder + photoName);
      },
    }),
  }).array("upload", 1);
  console.log(request.body);
  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response
        .status(500)
        .json({ message: "Erro ao fazer upload do vídeo." });
    }
    console.log("File uploaded successfully.");
    const photo = {
      link: photoName,
      reference_id: uuid,
    };

    return Photo.create(photo)
      .then((data) => {
        response.send({
          link: `${process.env.DEFAULT_URL}:${process.env.DEFAULT_PORT}/download/${data.reference_id}`,
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(400).send({
          message: "Não foi possivel salvar a foto",
        });
      });
  });
};

exports.UploadPhotoBase64 = (request, response) => {
  const base64Image = request.body.image;

  if (!base64Image || typeof base64Image !== "string") {
    return response
      .status(422)
      .send(
        "Você enviou uma imagem inválida: o parametro image é obrigatório e deve ser uma string."
      );
  }

  // const nameFileBase64 = formatDate();

  // fs.writeFile(`./base64-${nameFileBase64}.txt`, base64Image, (err) => {
  //   if (err) {
  //     console.error("Erro ao salvar o conteúdo Base64 em arquivo:", err);
  //   }

  //   console.log("Conteúdo Base64 salvo com sucesso em arquivo.txt");

  //   // Converte a imagem Base64 para um Buffer

  //   // Continue o restante do código aqui...
  // });

  const uuid = uuidv4();
  const photoName = `${uuid}.png`;

  // Assumindo que a imagem é enviada como parte do corpo da requisição

  // Converte a imagem Base64 para um Buffer
  const imageBuffer = Buffer.from(base64Image, "base64");

  // Parâmetros para upload do arquivo
  const uploadParams = {
    Bucket: bucket,
    Key: bucketFolder + photoName,
    Body: imageBuffer,
    ACL: "public-read",
  };

  // Envia a imagem para o bucket
  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error("Erro ao enviar a imagem para o bucket:", err);
      return response.status(500).send("Erro ao enviar a imagem para o bucket");
    }

    const photo = {
      link: photoName,
      reference_id: uuid,
    };

    return Photo.create(photo)
      .then((data) => {
        response.send({
          link: `${process.env.DEFAULT_URL}:${process.env.DEFAULT_PORT}/download/${data.reference_id}`,
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(400).send({
          message: "Não foi possivel salvar a foto",
        });
      });
  });
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
function formatDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year}-${hours}:${minutes}`;
}

const formatDateTime = () => {
  const dateObj = new Date();
  const formattedDate = dateObj.toLocaleDateString("pt-BR");
  const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date: formattedDate, time: formattedTime };
};
