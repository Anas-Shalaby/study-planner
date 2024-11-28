import express from "express";
import { auth } from "../middleware/auth.js";
import StudyPlan from "../models/StudyPlan.js";
import User from "../models/User.js";

const router = express.Router();

// Helper function to transform plan document
const transformPlan = (plan) => ({
  id: plan._id.toString(),
  title: plan.title,
  description: plan.description,
  startDate: plan.startDate,
  endDate: plan.endDate,
  tasks: plan.tasks.map((task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo?.toString(),
  })),
  members: plan.members.map((member) => ({
    id: member._id.toString(),
    user: member.user.toString(),
    role: member.role,
    joinedAt: member.joinedAt,
  })),
  invitations: plan.invitations.map((inv) => ({
    id: inv._id.toString(),
    email: inv.email,
    status: inv.status,
    invitedBy: inv.invitedBy.toString(),
    invitedAt: inv.invitedAt,
  })),
  createdBy: plan.createdBy.toString(),
  createdAt: plan.createdAt,
});

// Get all study plans (including ones where user is a member)
router.get("/", auth, async (req, res) => {
  try {
    const plans = await StudyPlan.find({
      $or: [{ createdBy: req.userId }, { "members.user": req.userId }],
    });
    res.json(plans.map(transformPlan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create study plan
router.post("/", auth, async (req, res) => {
  try {
    const plan = new StudyPlan({
      ...req.body,
      createdBy: req.userId,
      members: [{ user: req.userId, role: "leader" }],
    });
    await plan.save();
    res.status(201).json(transformPlan(plan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Invite member
router.post("/:id/invite", auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const { email } = req.body;

    // Check if already invited
    if (
      plan.invitations.some(
        (inv) => inv.email === email && inv.status === "pending"
      )
    ) {
      return res.status(400).json({ message: "User already invited" });
    }

    plan.invitations.push({
      email,
      invitedBy: req.userId,
    });

    await plan.save();
    res.json(transformPlan(plan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Accept/reject invitation
router.post("/:id/invitations/:invitationId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const invitation = plan.invitations.id(req.params.invitationId);
    if (!invitation || invitation.email !== user.email) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    const { status } = req.body;
    if (status === "accepted") {
      plan.members.push({ user: req.userId, role: "member" });
    }

    invitation.status = status;
    await plan.save();
    res.json(transformPlan(plan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Assign task
router.post("/:id/tasks/:taskId/assign", auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.userId },
        { "members.user": req.userId, "members.role": "leader" },
      ],
    });

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Plan not found or unauthorized" });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { userId } = req.body;
    const isMember = plan.members.some((m) => m.user.toString() === userId);
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "User is not a member of this plan" });
    }

    task.assignedTo = userId;
    await plan.save();
    res.json(transformPlan(plan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending invitations for current user
router.get("/invitations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const plans = await StudyPlan.find({
      invitations: {
        $elemMatch: {
          email: user.email,
          status: "pending",
        },
      },
    });
    res.json(plans.map(transformPlan));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
