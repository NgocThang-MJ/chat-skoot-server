import { Request, Response } from "express";
import cloudinary from "cloudinary";
import { ObjectId } from "mongodb";
import { getDbInstance } from "../../util/mongodb";

interface RequestImage {
  name: string;
  data: string;
  userId: string;
  img_name: string;
}

export const uploadAvt = async (req: Request, res: Response) => {
  try {
    const reqImg: RequestImage = req.body;
    const response = await cloudinary.v2.uploader.upload(reqImg.data, {
      public_id: `${reqImg.name.split(".")[0] + new Date().getTime()}`,
    });
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.body.userId) },
        {
          $set: {
            image: response.url,
            image_name: response.public_id,
          },
        }
      );
    await cloudinary.v2.uploader.destroy(reqImg.img_name);
    res.status(200).json(response);
  } catch (err) {
    console.log(err, "Error server");
    res.status(400).json({ msg: "Error" });
  }
};
