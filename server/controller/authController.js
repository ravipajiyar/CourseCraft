const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const axios = require("axios");
const Course = require("../models/courseModel");

// Base URL of the Python NLP service. Override with NLP_URL in the env
// (see config.env) when it does not run on the default port.
const NLP_URL = process.env.NLP_URL || "http://localhost:3001";

// The Gemini free tier is rate limited, and the NLP service surfaces a 429
// as a 500. Translate it into a message the UI can actually show.
const callNLP = async (path, body) => {
  try {
    return await axios.post(`${NLP_URL}${path}`, body);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 500) {
      throw new AppError(
        503,
        "The AI service is rate limited right now. Please wait a minute and try again."
      );
    }
    if (status === 429) {
      throw new AppError(
        429,
        "The AI service is rate limited right now. Please wait a minute and try again."
      );
    }
    if (!err?.response) {
      throw new AppError(
        503,
        "Could not reach the AI service. Is the NLP service running?"
      );
    }
    throw err;
  }
};

const signJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN,
  });
};

const createSendToken = (statusCode, user, res) => {
  const token = signJWT(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError(400, "both email and password is required to login")
    );
  const user = await User.findOne({ email }).select("+password");
  const validPassword = user
    ? await user.checkPassword(password, user.password)
    : false;
  if (!validPassword || !user) {
    return next(new AppError(401, "email or password is incorrect"));
  }

  createSendToken(200, user, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const userData = req.body;
  console.log(userData);
  const user = await User.create(userData);
  if (!user) {
    return next(new AppError(500, "something went wrong, please try again"));
  }

  const token = signJWT(user.id);
  user.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.generateQuestions = catchAsync(async (req, res, next) => {
  const { topic } = req.body;
  console.log(topic);

  const response = await callNLP("/generate-questions", { topic: topic });

  const advanced = response.data.questions.advanced;
  const basic = response.data.questions.basic;
  const intermediate = response.data.questions.intermediate;
  const data = { basic, intermediate, advanced };

  res.status(201).json({
    status: "success",
    data: data,
  });
});

exports.generateModule = catchAsync(async (req, res, next) => {
  const { questions, answers, topic } = req.body;

  const response = await callNLP("/generate-module", {
    topic,
    questions,
    answers,
  });

  const course = response.data;

  const courseModules = Object.keys(course.modules).map((modName, i) => {
    return {
      moduleNumber: i + 1,
      moduleName: modName,
      contents: course.modules[modName],
    };
  });

  const courseData = {
    title: course.course_title,
    modules: courseModules,
  };

  const newCourse = await Course.create(courseData);

  console.log("Saved course data", newCourse);

  res.status(200).json({
    status: "success",
    course: newCourse,
  });
});

exports.getNotes = catchAsync(async (req, res) => {
  const { topic } = req.body;
  const response = await callNLP("/get-notes", { topic });
  console.log(response.data);

  res.status(200).json({
    status: "success",
    notes: {
      topic,
      note: response.data,
    },
  });
});