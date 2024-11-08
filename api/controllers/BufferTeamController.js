const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dzzazpdx3',
  api_key: '772532348489814',
  api_secret: '7pIikiLTdtWkUyZtRVhhz7yz6u4'
});

module.exports = {
  addTeamDetail: async function (req, res) {
    try {
      const { teamName } = req.body;
      if (!teamName) {
        return res.status(404).json({ message: 'Team Name is required' });
      }

      const existingTeamName = await BufferTeam.findOne({ teamName: teamName });
      if (existingTeamName) {
        return res.status(400).json({ message: 'Team name already exists. Please choose a different name.' });
      }

      const fileStream = req.file('teamImage');

      if (!fileStream) {
        return res.badRequest('No file provided.');
      }

      fileStream.upload({}, async (err, uploadedFiles) => {
        if (err) {
          sails.log.error('File upload error:', err);
          return res.serverError('File upload failed.');
        }

        if (uploadedFiles.length === 0) {
          return res.badRequest('No file was uploaded.');
        }

        const filePath = uploadedFiles[0].fd;

        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'image' });
        const team = await BufferTeam.create({
          teamName,
          teamImage: uploadResult.url
        }).fetch();
        // sails.log('---Cloudinary Upload Result:', uploadResult);
        return res.ok({ message: 'Team Create successfully', result: team });

      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getTeamDetail: async function (req, res) {
    try {
      const team = await BufferTeam.find({ status: { '!=': 99 } });

      if (!team) {
        return res.status(404).json({ message: 'Buffer Team not found' });
      }
      return res.status(200).json({ success: true, team });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  updateTeam: async function (req, res) {
    const id = req.params.id;
    try {
      const team = await BufferTeam.findOne({ id });
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      if (!req.body.teamName) {
        return res.status(404).json({ message: 'Team Name is Required' });
      }
      if (req.body.teamName) {
        await BufferTeam.updateOne({ id }).set({ teamName: req.body.teamName });
      }

      const fileStream = req.file('teamImage');
      let newImageUrl = team.teamImage;

      if (fileStream) {
        fileStream.upload({}, async (err, uploadedFiles) => {
          if (err) {
            sails.log.error('File upload error:', err);
            return res.serverError('File upload failed.');
          }

          if (uploadedFiles && uploadedFiles.length > 0) {
            const filePath = uploadedFiles[0].fd;
            const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'image' });
            newImageUrl = uploadResult.secure_url;

            await BufferTeam.updateOne({ id }).set({ teamImage: newImageUrl });
          }

          return res.status(201).json({
            success: true,
            message: 'Team updated successfully',
            team: { teamName: req.body.teamName || team.teamName, teamImage: newImageUrl },
          });
        });
      } else {
        return res.status(201).json({
          success: true,
          message: 'Team updated successfully',
          team: { teamName: req.body.teamName || team.teamName, teamImage: newImageUrl },
        });
      }
    } catch (error) {
      console.error('Update team error:', error);
      return res.status(500).json({ message: 'Failed to update', error });
    }
  },
  removeTeam: async function (req, res) {
    const id = req.params.id;

    try {
      const team = await BufferTeam.updateOne({ id }).set({ status: 99 });

      return res.status(200).json({ message: 'Remove Team successfully', team });
    } catch (error) {
      console.error('Error removing user:', error);
      return res.serverError(error);
    }
  },
};
