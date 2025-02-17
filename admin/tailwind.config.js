module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-g': 'your-primary-color-here', // Replace with your primary color
      },
    },
    content: [
      // './src/**/*.{html,js}',
        'node_modules/preline/dist/*.js',
    ],
    plugins: [
      // require('@tailwindcss/forms'),
        require('preline/plugin'),
    ],
  },
} 