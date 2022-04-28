<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col min-vh-100 p-4">
        <div class="col-lg-6 mx-auto p-3 py-md-5">
          <form @submit="onSubmit" class="form-signin d-grid gap-2">
            <div class="text-center mb-4"><a href="https://paradone.com"><img class="mb-4" src="../assets/img/light-bulb.png" alt="" width="72" height="72" /></a>
              <h1 class="h3 mb-3 font-weight-normal">Create Account</h1>
            </div>
            <div class="form-floating">
              <input v-model="username" class="form-control" type="text" placeholder="Username" name="username" minlength="4" pattern="^[a-zA-Z0-9@.]*$" required="" autofocus=""/>
              <label for="inputUsername">Choose a Username</label>
            </div>
            <div class="form-floating">
              <input v-model="email" class="form-control" type="email" placeholder="Email" name="email" required=""/>
              <label for="inputUsername">Enter your email</label>
            </div>
            <div class="form-floating">
              <input v-model="password" class="form-control" type="password" placeholder="Password" name="password" required=""/>
              <label for="inputPassword">Create a Password</label>
            </div>
            <div v-show="errorMessage" class="alert alert-danger mb-0" role="alert">
              {{ errorMessage }}
            </div>
            <button class="btn btn-lg btn-dark btn-block" type="submit">Create Account</button>
            <div class="text-center mb-4"><router-link to="/login" class="nav-link text-dark">Already have an account?</router-link></div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  inheritAttrs: false, // disable 'non-props' warning
  data() {
    return {
      username: '',
      email: '',
      password: '',
      errorMessage: ''
    }
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault()
      const newUser = {
        username: this.username,
        email: this.email,
        password: this.password
      }
      this.$store.dispatch('register', newUser).then((error) => {
        if (error) {
          this.errorMessage = error.msg
        } else {
          this.$router.push('/')
        }
      })
    }
  }
}
</script>

<style scoped>
:root {
  --input-padding-x: .75rem;
  --input-padding-y: .75rem;
}

html,
body {
  height: 100%;
}

body {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
}

.form-signin {
  width: 100%;
  max-width: 420px;
  padding: 15px;
  margin: 0 auto;
}

.form-label-group {
  position: relative;
  margin-bottom: 1rem;
}

.form-label-group > input,
.form-label-group > label {
  padding: var(--input-padding-y) var(--input-padding-x);
}

.form-label-group > label {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  margin-bottom: 0; /* Override default `<label>` margin */
  line-height: 1.5;
  color: #495057;
  border: 1px solid transparent;
  border-radius: .25rem;
  transition: all .1s ease-in-out;
}

.form-label-group input::-webkit-input-placeholder {
  color: transparent;
}

.form-label-group input:-ms-input-placeholder {
  color: transparent;
}

.form-label-group input::-ms-input-placeholder {
  color: transparent;
}

.form-label-group input::-moz-placeholder {
  color: transparent;
}

.form-label-group input::placeholder {
  color: transparent;
}

.form-label-group input:not(:placeholder-shown) {
  padding-top: calc(var(--input-padding-y) + var(--input-padding-y) * (2 / 3));
  padding-bottom: calc(var(--input-padding-y) / 3);
}

.form-label-group input:not(:placeholder-shown) ~ label {
  padding-top: calc(var(--input-padding-y) / 3);
  padding-bottom: calc(var(--input-padding-y) / 3);
  font-size: 12px;
  color: #777;
}
</style>
