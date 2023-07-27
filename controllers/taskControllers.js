const Users = require("../models/user.js");
const jwt = require("jsonwebtoken");
const Tasks = require("../models/task.js");
const bcrypt = require('bcrypt');
const { valid } = require("joi");
const JWT_SECRET = "newtonSchool";

/*

request.body = {
    heading: heading,
    description: description,
    token: token
}

1. Create new task from request body .
2. From JWT token payload get creator_id of this task. (userId in payload will be creator_id).
3. Save heading, description, creator_id for every task.

Response :

1. Success

200 StatusCode

json = 
{
    "message": 'Task added successfully',
    "task_id": task._id, //id of task that is created.
    "status": 'success'
}

2. Unabel to verify token (Invalid Token)
404 Status Code
json = 
{
    "status": 'fail',
    "message": 'Invalid token'
}

3. Fail to do

404 Status Code
json = 
{
    "status": 'fail',
    "message": error message
}

*/

const createTask = async (req, res) => {
    //creator_id is user id who have created this task.
    try {
        const { heading, description, token } = req.body;
        if (!heading) return res.status(404).json({ status: "error", message: " Heading is required!" })
        if (!description) return res.status(404).json({ status: "error", message: " Description is required!" })
        if (!token) return res.status(404).json({ status: "error", message: " Token is required!" })

        const decodedToken = jwt.verify(token, JWT_SECRET)

        if (!decodedToken) {
            return res.status(404).json(
                {
                    status: 'fail',
                    message: 'Invalid token'
                }
            )
        }
        const { userId } = decodedToken;

        const isUserExist = await Users.findOne({ _id: userId });

        if (isUserExist) {
            const task = new Tasks({
                heading, description, creator_id: userId
            })
            await task.save();

            return res.status(200).json({
                message: 'Task added successfully',
                task_id: task._id, //id of task that is created.
                status: 'success'
            })
        } else {
            return res.status(404).json(
                {
                    status: 'fail',
                    message: 'User is not present in Database.'
                }
            )
        }
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message
        })
    }
}

/*

getdetailTask Controller

req.body = {
    "task_id" : task_id,
    "token" : token
}

1. Return the detail of the task with given task_id.
2. For this task you will be only test with valid (Existing) task_id.

Response --> 

1. Success

200 Status code

json = {
  status: 'success',
  data: {
    Status: 'pending',
    _id: 'mxcnbxzcn-khscc',
    heading: 'Study Doglapan',
    description: 'Need to study atleast 10 Pages',
    creator_id: 'kdjhgsdjgmsbmbs'
  }
}

2. Fail

404 Status Code
json = {
    "status": 'fail',
    "message": error message
}

*/

const getdetailTask = async (req, res) => {
    try {
        const task_id = req.body.task_id;

        if (!task_id) return res.status(404).json({ status: "fail", message: "Task Id required!" })

        const isTaskExist = await Tasks.findById(task_id);

        if (isTaskExist) {
            return res.status(200).json({
                status: 'success',
                data: {
                    Status: isTaskExist.status,
                    _id: isTaskExist._id,
                    heading: isTaskExist.heading,
                    description: isTaskExist.description,
                    creator_id: isTaskExist.creator_id
                }
            })
        } else {
            return res.status(500).json({
                status: 'fail',
                message: error.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message
        })
    }
}

module.exports = { createTask, getdetailTask };