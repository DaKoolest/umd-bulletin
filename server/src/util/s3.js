import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import sharp from "sharp";

const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKey = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
});

async function getS3ImageUrl(imageName) {
    const getObjectParams = {
        Bucket: bucketName,
        Key: imageName,
    };
    const command = new GetObjectCommand(getObjectParams);
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function putS3Image(imageKey, processedImage) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
        Body: processedImage,
        ContentType: "image/jpeg",
    });

    await s3.send(command);
}

async function deleteS3Image(imgKey) {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: imgKey,
    });

    await s3.send(command);
}

async function uploadAndProcessS3Image(imgBuffer) {
    if (!imgBuffer) {
        return undefined;
    }

    const processedImage = await sharp(imgBuffer)
        .resize(400, 400, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({ quality: 65 })
        .toBuffer();

    const imageKey = crypto.randomBytes(32).toString("hex");

    await putS3Image(imageKey, processedImage);
    return imageKey;
}

export default {
    deleteS3Image,
    putS3Image,
    getS3ImageUrl,
    uploadAndProcessS3Image,
};
