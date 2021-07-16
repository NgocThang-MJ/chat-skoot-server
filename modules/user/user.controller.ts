import { Request, Response } from "express";
import cloudinary from "cloudinary";
import { ObjectId } from "mongodb";
import { getDbInstance } from "../../util/mongodb";
import { RequestImage } from "./user.interface";

export const uploadAvt = async (req: Request, res: Response) => {
  try {
    const reqImg: RequestImage = req.body;
    const response = await cloudinary.v2.uploader.upload(reqImg.data, {
      public_id: `${reqImg.name.split(".")[0] + new Date().getTime()}`,
    });
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.body.user_id) },
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
    console.log(err, "Error when change avatar");
    res.status(400).json({ msg: "Error" });
  }
};

export const changeUsername = async (req: Request, res: Response) => {
  try {
    const { newUsername, user_id } = req.body;
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            name: newUsername,
          },
        }
      );
    res.status(200).json({ newUsername });
  } catch (err) {
    console.log(err, "Error when change user name");
    res.status(400).json({ msg: "Error" });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const searchedUser = await getDbInstance()
      .collection("users")
      .aggregate([
        {
          $search: {
            text: {
              path: "name",
              query: query,
            },
          },
        },
        {
          $project: {
            name: 1,
            image: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({ users: searchedUser });
  } catch (err) {
    console.log("Error when search user", err);
    res.status(400).json({ msg: "Error" });
  }
};

export const fetchUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbInstance()
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    res.status(200).json(user);
  } catch (err) {
    console.log("Error when fetch user by id: ", err);
    res.status(400).json({ msg: "Error" });
  }
};

export const fetchUsersByIds = async (req: Request, res: Response) => {
  try {
    const ids: string[] = req.body.ids;
    const objIdArray = ids.map((id) => {
      return new ObjectId(id);
    });
    const users = await getDbInstance()
      .collection("users")
      .aggregate([
        { $match: { _id: { $in: objIdArray } } },
        { $project: { image: 1, name: 1 } },
      ])
      .toArray();
    res.status(200).json(users);
  } catch (err) {
    console.log("Error when fetch users by ids: ", err);
    res.status(400).json({ msg: "Error" });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(receiverId) },
        { $addToSet: { friend_requests: senderId } }
      );
    res.status(200).json({ msg: "ok" });
  } catch (err) {
    console.log("Error when send friend request: ", err);
    res.status(400).json({ msg: "Error" });
  }
};

export const approveFriendRequest = async (req: Request, res: Response) => {
  try {
    const { user_id, friendId } = req.body;
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(user_id) },
        {
          $addToSet: { friends: friendId },
          $pull: { friend_requests: friendId },
        }
      );
    await getDbInstance()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(friendId) },
        { $addToSet: { friends: user_id } }
      );
    res.status(200).json({ msg: "ok" });
  } catch (err) {
    console.log("Error when approve friend request: ", err);
    res.status(400).json({ msg: "Error" });
  }
};
