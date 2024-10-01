module.exports = {
    ci: {
      collect: {
        staticDistDir: './build',
      },
      assert: {
        preset: 'lighthouse:recommended',
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  };