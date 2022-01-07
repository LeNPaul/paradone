<template>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="home" viewBox="0 0 16 16">
      <path
        d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z">
      </path>
    </symbol>
    <symbol id="speedometer2" viewBox="0 0 16 16">
      <path
        d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z">
      </path>
      <path fill-rule="evenodd"
        d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z">
      </path>
    </symbol>
    <symbol id="tools" viewBox="0 0 16 16">
      <path
        d="M1 0L0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.356 3.356a1 1 0 0 0 1.414 0l1.586-1.586a1 1 0 0 0 0-1.414l-3.356-3.356a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3c0-.269-.035-.53-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814L1 0zm9.646 10.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708zM3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026L3 11z">
      </path>
    </symbol>
  </svg>
  <div class="container py-5">
    <header class="d-flex flex-column flex-md-row align-items-center pb-3 mb-5 border-bottom"><router-link to="/" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="fs-4 fw-bold">paradone</span></router-link>
      <nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">
        <router-link to="/register" class="me-3 py-2 text-dark text-decoration-none">register</router-link>
        <router-link to="/login" class="me-3 py-2 text-dark text-decoration-none">login</router-link>
      </nav>
    </header>
    <div class="container py-5">
      <h1 class="col-md-7">Choose your productivity paradigm with paradone</h1>
      <p class="fs-5 col-md-7">Organize your tasks to fit any productivity system paradigm.</p>
      <div class="mb-5"><router-link to="/register" class="btn btn-dark btn-lg px-4">Get Started</router-link></div>
    </div>
    <div class="container py-5">
      <div class="row py-5">
        <div class="col-md-2">
          <svg width="100%">
            <use xlink:href="#home"></use>
          </svg>
        </div>
        <div class="col-md-6">
          <h4 class="fw-bold mb-0">Give your tasks a flexible home</h4>
          <p>Whether you want a basic to-do app, or a full-featured productivity system, you can flexibly change your dashboard in an instant.</p>
        </div>
      </div>
      <div class="row py-5">
        <div class="col-md-2">
          <svg width="100%">
            <use xlink:href="#speedometer2"></use>
          </svg></div>
        <div class="col-md-6">
          <h4 class="fw-bold mb-0">Spend less time organizing or migrating your tasks</h4>
          <p>We all get excited when we learn about a new way to get things done, but we waste time migrating our tasks. With paradone, instantly change your productivity system paradigm without having to migrate.</p>
        </div>
      </div>
      <div class="row py-5">
        <div class="col-md-2">
          <svg width="100%">
            <use xlink:href="#tools"></use>
          </svg>
        </div>
        <div class="col-md-6">
          <h4 class="fw-bold mb-0">Configure your task management system however you want</h4>
          <p>Options include different productivity systems and views for your tasks.</p>
        </div>
      </div>
    </div>
    <div class="container py-5">
      <div class="row py-5">
        <div class="col-md-6 mx-auto text-center">
          <h1 class="pb-5">Get things done with paradone</h1><router-link to="/register" class="btn btn-dark btn-lg px-4">Get Started</router-link>
        </div>
      </div>
    </div>
    <footer class="pt-4 my-md-5 pt-md-5 border-top">
      <div class="row">
        <div class="col-12 col-md">
          <h5>paradone</h5><small class="d-block mb-3 text-muted">© 2021</small>
        </div>
        <div class="col-6 col-md">
          <h5>Resources</h5>
          <ul class="list-unstyled text-small">
            <li class="mb-1"><router-link to="/register" class="link-secondary text-decoration-none">Register</router-link></li>
            <li class="mb-1"><router-link to="/login" class="link-secondary text-decoration-none">Login</router-link></li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</body>
</template>

<script>
export default {
  name: 'Home',
  inheritAttrs: false, // disable 'non-props' warning
}
</script>
