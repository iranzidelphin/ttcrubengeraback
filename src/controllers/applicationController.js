import { Application } from '../models/Application.js';
import { serializeApplication } from '../utils/applicationSerializer.js';
import {
  buildAdditionalFormLink,
  createAdditionalFormToken,
  sendApplicationEmail,
} from '../utils/applicationMail.js';

export async function createApplication(req, res) {
  try {
    const {
      sdmsCode,
      firstName,
      lastName,
      lastLevelMark,
      tradeOrSection,
      model,
      gender,
      level,
      fatherName = '',
      motherName = '',
      phone,
      dateOfBirth,
      studentEmail,
      reasonToApply = '',
    } = req.body;

    if (
      !sdmsCode ||
      !firstName ||
      !lastName ||
      !lastLevelMark ||
      !tradeOrSection ||
      !model ||
      !gender ||
      !level ||
      !phone ||
      !dateOfBirth ||
      !studentEmail
    ) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required application fields.',
      });
    }

    const application = await Application.create({
      sdmsCode: sdmsCode.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lastLevelMark: Number(lastLevelMark),
      tradeOrSection: tradeOrSection.trim(),
      model: model.trim(),
      gender: gender.trim(),
      level: level.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      phone: phone.trim(),
      dateOfBirth,
      studentEmail: studentEmail.trim().toLowerCase(),
      reasonToApply: reasonToApply.trim(),
    });

    res.status(201).json({
      success: true,
      application: serializeApplication(application),
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not submit application.',
    });
  }
}

export async function listApplications(req, res) {
  const applications = await Application.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    applications: applications.map(serializeApplication),
  });
}

export async function getApplication(req, res) {
  const application = await Application.findById(req.params.applicationId);

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found.',
    });
  }

  res.status(200).json({
    success: true,
    application: serializeApplication(application),
  });
}

export async function sendApplicationResponse(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found.',
      });
    }

    const {
      subject,
      text,
      kind = 'custom',
      requestAdditionalForm = false,
      markStatus,
      adminNotes = '',
    } = req.body;

    if (!subject?.trim() || !text?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required.',
      });
    }

    let emailText = text.trim();

    if (requestAdditionalForm) {
      const token = createAdditionalFormToken();
      const link = buildAdditionalFormLink(token);
      application.additionalFormToken = token;
      application.additionalFormRequestedAt = new Date();
      application.status = 'additional-info-requested';
      emailText = `${emailText}\n\nComplete the additional form here:\n${link}`;
    }

    if (markStatus && ['submitted', 'additional-info-requested', 'additional-info-received', 'accepted', 'rejected'].includes(markStatus)) {
      application.status = markStatus;
    }

    if (adminNotes.trim()) {
      application.adminNotes = adminNotes.trim();
    }

    await sendApplicationEmail({
      to: application.studentEmail,
      subject: subject.trim(),
      text: emailText,
    });

    application.emailLogs.unshift({
      subject: subject.trim(),
      text: emailText,
      kind,
    });

    await application.save();

    res.status(200).json({
      success: true,
      application: serializeApplication(application),
    });
  } catch (error) {
    console.error('Send application email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Could not send email.',
    });
  }
}

export async function getAdditionalApplication(req, res) {
  const application = await Application.findOne({
    additionalFormToken: req.params.token,
  });

  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Additional form link is invalid or expired.',
    });
  }

  res.status(200).json({
    success: true,
    application: {
      id: application._id.toString(),
      fullName: `${application.firstName} ${application.lastName}`.trim(),
      tradeOrSection: application.tradeOrSection,
      level: application.level,
      studentEmail: application.studentEmail,
      status: application.status,
    },
  });
}

export async function submitAdditionalApplication(req, res) {
  try {
    const application = await Application.findOne({
      additionalFormToken: req.params.token,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Additional form link is invalid or expired.',
      });
    }

    const { schoolFeesDetails = '', additionalInformation = '' } = req.body;

    application.schoolFeesDetails = schoolFeesDetails.trim();
    application.additionalInformation = additionalInformation.trim();
    application.additionalFormSubmittedAt = new Date();
    application.status = 'additional-info-received';

    if (req.file) {
      application.schoolFeesApprovalFileName = req.file.originalname;
      application.schoolFeesApprovalFileUrl = `/uploads/applications/${req.file.filename}`;
    }

    await application.save();

    res.status(200).json({
      success: true,
      application: serializeApplication(application),
    });
  } catch (error) {
    console.error('Submit additional application error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not submit additional information.',
    });
  }
}
