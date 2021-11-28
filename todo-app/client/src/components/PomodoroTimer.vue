<template>
  <div class="col-lg-6 p-3 py-md-5 mx-auto">
      <div class="p-3">
        <!-- https://codepen.io/Chuloo/pen/xWVpqq-->
        <div class="mx-auto text-center mt-5 mb-3">
          <h1 class="display-1"> <span>{{ minutes }}</span><span>:</span><span>{{ seconds }}</span></h1>
          <div class="mb-5"><button class="btn btn-outline-dark me-2" type="button" v-if="!timer" v-on:click="startTimer">Start</button><button class="btn btn-outline-dark me-2" type="button" v-if="timer" v-on:click="stopTimer">Pause</button><button class="btn btn-outline-dark" type="button" v-if="resetButton" v-on:click="resetTimer">Reset </button></div>
        </div>
      </div>
  </div>
</template>

<script>

export default {
  name: 'PomodoroTimer',
  inheritAttrs: false, // disable 'non-props' warning
  data() {
    return {
      timer: null,
      totalTime: (25 * 60),
      resetButton: false,
      title: "Let the countdown begin!!"
    }
  },
  // ========================
  methods: {
    startTimer: function() {
      this.start = new Date();
      this.timer = setInterval(() => this.countdown(), 1000);
      this.resetButton = true;
    },
    stopTimer: function() {
      clearInterval(this.timer);
      this.timer = null;
      this.resetButton = true;
    },
    resetTimer: function() {
      this.totalTime = (25 * 60);
      clearInterval(this.timer);
      this.timer = null;
      this.resetButton = false;
    },
    padTime: function(time) {
      return (time < 10 ? '0' : '') + time;
    },
    countdown: function() {
      if(this.totalTime >= 1){
        this.totalTime = (25 * 60) - Math.floor(((new Date() - this.start) / 1000));
      } else{
        // https://soundbible.com/1630-Computer-Magic.html
        var audio = new Audio('/assets/pomodoro.mp3');
        audio.play();
        this.totalTime = 0;
        this.resetTimer()
      }
    }
  },
  // ========================
  computed: {
    minutes: function() {
      const minutes = Math.floor(this.totalTime / 60);
      return this.padTime(minutes);
    },
    seconds: function() {
      const seconds = this.totalTime - (this.minutes * 60);
      return this.padTime(seconds);
    }
  },
};
</script>

<style scope>
#message {
  color: #DDD;
  font-size: 50px;
  margin-bottom: 20px;
}

#timer {
  font-size: 200px;
  line-height: 1;
  margin-bottom: 40px;
}
</style>
