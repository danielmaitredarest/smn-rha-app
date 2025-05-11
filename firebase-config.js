<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyA4VIuMHFdCG4BWgNYvsvIJPIA6q9zJq74",
    authDomain: "smn-rha-app.firebaseapp.com",
    projectId: "smn-rha-app",
    storageBucket: "smn-rha-app.firebasestorage.app",
    messagingSenderId: "756944571309",
    appId: "1:756944571309:web:ed0a173c23f882e00eef24",
    measurementId: "G-XZHJ9ELRK1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>