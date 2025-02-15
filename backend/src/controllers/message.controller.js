import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from "stream";
import {getReceiverSocketId} from "../lib/socket.js"
import { io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filterUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const sendMessageDemo = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    let imageurl = null;

    // Handle file upload with async-await
    if (req.file) {
      imageurl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat_images" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              reject(error); // Reject if upload fails
            } else {
              resolve(result.secure_url); // Resolve with uploaded image URL
            }
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      });
    }

    // Save message to database
    const newMessage = new Message({
      senderId,
      receiverId,
      text: req.body.text,
      image: imageurl, // Will be null if no image is uploaded
    });

    await newMessage.save();

    // Emit event to receiver if they are online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};