import { S3, PutObjectCommand, GetBucketAclCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3({
  region: region,
});

async function uploadFIle(fileName, fileBuffer, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };
  const command = new PutObjectCommand(uploadParams);
  return await s3Client.send(command);
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
