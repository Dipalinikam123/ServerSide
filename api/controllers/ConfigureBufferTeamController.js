module.exports = {
  addSelectedTeam: async (req, res) => {
    console.log('-----req', req.body);
    try {
      const { challengeName, teams } = req.body;
      if (!challengeName) {
        return res.status(404).json({ message: 'challenge Name are required' });
      }
      if (!teams.length > 0) {
        return res.status(400).json({ message: 'Please Select the team' });
      }

      const existingChallenge = await ConfigureBufferTeam.findOne({ challengeName });

      if (existingChallenge) {
        return res.status(400).json({ message: 'Challenge name already exists. Please choose a different name.' });
      }

      if (!Array.isArray(teams)) {
        return res.json({ message: 'Teams should be an array of team objects' });
      }

      const newChallenge = await ConfigureBufferTeam.create({ challengeName, teams }).fetch();

      return res.status(200).json(newChallenge);
    } catch (error) {
      return res.serverError(error);
    }
  },
  getSelectedTeam: async function (req, res) {
    try {
      const teams = await ConfigureBufferTeam.find();

      if (!teams) {
        return res.status(404).json({ message: 'Buffer Team not found' });
      }
      return res.status(200).json({ success: true, teams });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
