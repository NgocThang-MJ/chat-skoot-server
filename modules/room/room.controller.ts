import { Request, Response } from "express";
import { getDbInstance } from "../../util/mongodb";

export const fetchRooms = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.user_id;
    const rooms = await getDbInstance()
      .collection("rooms")
      .find({
        memberIds: { $in: [user_id] },
      })
      .sort({ last_date_msg: -1 })
      .toArray();
    res.status(200).json(rooms);
  } catch (err) {
    console.log("Error when fetch rooms", err);
    res.status(400).json({ msg: "Error" });
  }
};

export const fetchMessages = async (req: Request, res: Response) => {
  try {
    const { room_id, skip } = req.params;
    console.log(skip);
    console.log((parseInt(skip) || 0) * 25, "skip");
    const messages = await getDbInstance()
      .collection("chats")
      .aggregate([
        { $match: { room_id } },
        { $sort: { createdAt: -1 } },
        { $project: { _id: 0, content: 1, sender_id: 1 } },
        { $skip: (parseInt(skip) || 0) * 25 },
        { $limit: 25 },
      ])
      .toArray();
    res.status(200).json(messages);
  } catch (err) {
    console.log("Error when fetch messages", err);
    res.status(400).json({ msg: "Error" });
  }
};
