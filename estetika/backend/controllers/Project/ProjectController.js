const Project = require("../../models/Project/Project");
const User = require("../../models/User/User");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

// Get Project by Id or projectCreator
const project_get = catchAsync(async (req, res, next) => {
  const { id, projectCreator, member, index } = req.query;

  let project;

  if (!id && !projectCreator && !member && !index)
    return next(new AppError("Project identifier not found", 400));

  const populateOptions = [
    { path: "members", select: "-password" },
    { path: "tasks" },
    { path: "timeline", populate: { path: "tasks" } },
    { path: "projectCreator", select: "-password" },
    { path: "projectUpdates" },
    { path: "designRecommendation" },
  ];

  if (id) {
    project = await Project.findById(id).populate(populateOptions);
  } else if (projectCreator) {
    project = await Project.find({ projectCreator }).populate(populateOptions);
  } else if (member) {
    project = await Project.find({ members: member }).populate(populateOptions);
  } else if (index) {
    project = await Project.find().populate(populateOptions);
  }

  if (!project || (Array.isArray(project) && project.length === 0))
    return next(
      new AppError("Project not found. Invalid Project Identifier.", 404)
    );

  const isPastEndDate = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  if (id) {
    project = project.toObject ? project.toObject() : project;
    if (project.timeline && Array.isArray(project.timeline)) {
      project.timeline.forEach((ph) => {
        let weight =
          ph.tasks && ph.tasks.length > 0 ? 100 / ph.tasks.length : 0;
        let total = 0;

        if (ph.tasks && Array.isArray(ph.tasks)) {
          ph.tasks.forEach((task) => {
            if (task.status === "completed") {
              total += weight;
            }
          });
        }

        ph.progress = total;
      });

      let totalPhases = project.timeline.length;
      let overallProgress = 0;
      if (totalPhases > 0) {
        overallProgress =
          project.timeline.reduce((sum, ph) => sum + (ph.progress || 0), 0) /
          totalPhases;
      }
      project.progress = overallProgress;
    } else {
      project.progress = 0;
    }

    if (isPastEndDate(project.endDate) && project.status === "ongoing") {
      project.status = "delayed";
    }
  } else {
    project.forEach((proj, idx) => {
      if (proj.toObject) project[idx] = proj = proj.toObject();
      if (proj.timeline && Array.isArray(proj.timeline)) {
        proj.timeline.forEach((ph) => {
          let weight =
            ph.tasks && ph.tasks.length > 0 ? 100 / ph.tasks.length : 0;
          let total = 0;

          if (ph.tasks && Array.isArray(ph.tasks)) {
            ph.tasks.forEach((task) => {
              if (task.status === "completed") {
                total += weight;
              }
            });
          }

          ph.progress = total;
        });
      }
    });

    project.forEach((proj, idx) => {
      if (
        proj.timeline &&
        Array.isArray(proj.timeline) &&
        proj.timeline.length > 0
      ) {
        const totalPhases = proj.timeline.length;
        const overallProgress =
          proj.timeline.reduce((sum, ph) => sum + (ph.progress || 0), 0) /
          totalPhases;
        proj.progress = overallProgress;
      } else {
        proj.progress = 0;
      }

      if (isPastEndDate(proj.endDate) && proj.status === "ongoing") {
        proj.status = "delayed";
      }
    });
  }

  return res
    .status(200)
    .json({ message: "Project Successfully Fetched", project });
});

// Create Project
const project_post = catchAsync(async (req, res, next) => {
  const projectCreator = req.id;
  const {
    title,
    description,
    budget,
    startDate,
    endDate,
    files,
    tasks,
    timeline,
    roomType,
    projectSize,
    projectLocation,
    designPreference,
    designInspiration,
    designRecommendation,
  } = req.body;

  const isUserValid = await User.findById(projectCreator);

  if (!isUserValid)
    return next(new AppError("User not found. Invalid User ID.", 404));

  if (!title) {
    return next(new AppError("Cannot create project, missing title.", 400));
  }

  const newProject = new Project({
    title,
    description,
    budget,
    startDate,
    endDate,
    files,
    tasks,
    timeline,
    projectCreator,
    roomType,
    projectSize,
    projectLocation,
    designPreference,
    designInspiration,
    designRecommendation,
  });

  await newProject.save();

  await User.findByIdAndUpdate(
    projectCreator,
    { $push: { projectsId: newProject._id } },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "Project Successfully Created", newProject });
});

// Update Project
const project_put = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const {
    title,
    description,
    budget,
    startDate,
    endDate,
    files,
    members,
    tasks,
    timeline,
    status,
    roomType,
    projectSize,
    projectLocation,
    designPreference,
    designInspiration,
    designRecommendation,
    projectUpdates,
  } = req.body;

  if (!id) return next(new AppError("Project identifier not found", 400));

  const project = await Project.findById(id);
  if (!project)
    return next(new AppError("Project not found. Invalid Project ID.", 404));

  let updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (budget !== undefined) updates.budget = budget;
  if (startDate) updates.startDate = startDate;
  if (endDate) updates.endDate = endDate;
  if (files) updates.files = files;
  if (members) {
    if (Array.isArray(members)) {
      const resolvedMembers = await Promise.all(
        members.map(async (member) => {
          if (project.members.includes(member)) {
            return member;
          }
          const user = await User.findOne({
            $or: [{ email: member }, { username: member }],
          });
          return user ? user._id : null;
        })
      );
      updates.members = resolvedMembers.filter(Boolean);
    }
  }
  if (tasks) updates.tasks = tasks;
  if (timeline) updates.timeline = timeline;
  if (status) updates.status = status;
  if (roomType) updates.roomType = roomType;
  if (projectSize !== undefined) updates.projectSize = projectSize;
  if (projectLocation) updates.projectLocation = projectLocation;
  if (designPreference) updates.designPreference = designPreference;
  if (designInspiration) updates.designInspiration = designInspiration;
  if (designRecommendation) updates.designRecommendation = designRecommendation;
  if (projectUpdates) updates.projectUpdates = projectUpdates;

  const updatedProject = await Project.findByIdAndUpdate(id, updates, {
    new: true,
  });

  if (!updatedProject) return next(new AppError("Project not found", 404));

  return res
    .status(200)
    .json({ message: "Project Updated Successfully", updatedProject });
});

// Delete Project
const project_delete = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new AppError("Project identifier not found", 400));

  const project = await Project.findById(id);
  if (!project) return next(new AppError("Project not found", 404));

  if (project.projectCreator.toString() !== req.id && req.role !== "admin") {
    return next(
      new AppError("You are not authorized to delete this project", 403)
    );
  }

  // Remove related tasks and timeline phases

  const deletedProject = await Project.findByIdAndDelete(id);

  if (!deletedProject) return next(new AppError("Project not found", 404));

  await Promise.all([
    Project.db.model("Task").deleteMany({ _id: { $in: project.tasks } }),
    Project.db.model("Phase").deleteMany({ _id: { $in: project.timeline } }),
    Project.db
      .model("ProjectUpdate")
      .deleteMany({ _id: { $in: project.projectUpdates } }),
  ]);

  await User.findByIdAndUpdate(
    deletedProject.projectCreator,
    { $pull: { projectsId: deletedProject._id } },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "Project Successfully Deleted", deletedProject });
});

module.exports = {
  project_get,
  project_post,
  project_put,
  project_delete,
};
