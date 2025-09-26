import { S3, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.AWS_S3_ENDPOINT;

const s3Client = new S3({
  region: region,
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

async function uploadFIle(fileName, fileBuffer, mimetype) {
  try{
    const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };
  const command = new PutObjectCommand(uploadParams);
  return await s3Client.send(command);
  } catch (err){
    console.log("Error al subir a s3" + err)
  }
  
}

async function getSignedUrlForFile(fileName, expiresIn = 3600) {
  const getObjectParams = {
    Bucket: bucketName,
    Key: fileName,
  };
  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3Client, command, { expiresIn });
}

export { uploadFIle, getSignedUrlForFile };
