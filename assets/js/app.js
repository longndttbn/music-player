/* Các bước làm
1. Render song
2. Scroll top
3. Play /pause / seek
4. CD rotate
5. Next / pause
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song into view
10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $(".player");
const cd = $(".cd");
const heading = $("header h1");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const btnPlay = $(".btn-toggle-play");
const progress = $("#progress");
const btnNext = $(".btn-next");
const btnPrevious = $(".btn-prev");
const btnRandom = $(".btn-random");
const btnRepeat = $(".btn-repeat");
const playList =  $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "You are my sun shine Elsa",
      singer: "Elizabeth Mitchell",
      path: "./assets/music/YouareMySunshine.mp3",
      image: "./assets/img/you_are_my_sunshine.jpg",
    },
    {
      name: "Always Remember Us This Way",
      singer: "Lady Gaga",
      path: "./assets/music/AlwaysRememberUsThisWay-LadyGaga-5693911.mp3",
      image: "./assets/img/1.jpg",
    },
    {
      name: "Shallow",
      singer: "Lady Gaga",
      path: "./assets/music/Shallow-Lady-Gaga_ Bradley-Cooper.mp3",
      image: "./assets/img/2.jpg",
    },
    {
      name: "I Never Love Again",
      singer: "Lady Gaga",
      path: "./assets/music/ILlNeverLoveExtendedVersionRadioEdit-LadyGaga-5693922.mp3",
      image: "./assets/img/3.jpg",
    },
    {
      name: "Heal Me",
      singer: "Lady Gaga",
      path: "./assets/music/healme.mp3",
      image: "./assets/img/4.jpg",
    },
    {
      name: "Before I Cry",
      singer: "Lady Gaga",
      path: "./assets/music/BeforeICry-LadyGaga-5693918.mp3",
      image: "./assets/img/5.png",
    },
    {
      name: "Too Far Gone",
      singer: "Bradley Cooper",
      path: "./assets/music/toofar.mp3",
      image: "./assets/img/6.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
            <div data-index="${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
    });

    // 1. Render songs
    playList.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  /*
  Hàm định nghĩa defineProperties giống với hàm getCurrentSong nên chỉ cần dùng hàm bên trên
  getCurrentSong: function () {
      return this.songs[this.currentIndex];
  },
  */

  handleEvent: function () {
    const _this = this;
    // 2. Handle top
    const cdWidth = cd.offsetWidth;

    // 4. Xử lý cd quay
    const cdThumbAnimation = cdThumb.animate([{ transform: "rotate(360deg" }], {
      duration: 10000,
      iterations: Infinity,
    });

    // Xử lý phóng to thu nhỏ icon thumb
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý nút Play
    btnPlay.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimation.play();
    };

    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimation.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    progress.onchange = function (e) {
      const seekTime = Math.floor((e.target.value * audio.duration) / 100);
      audio.currentTime = seekTime;
    };

    audio.oninput = function () {
      var value = ((this.value - this.min) / (this.max - this.min)) * 100;
      this.style.background =
        "linear-gradient(to right, #82CFD0 0%, #82CFD0 " +
        value +
        "%, #fff " +
        value +
        "%, white 100%)";
    };

    audio.onended = function () {
      // Kết thúc bài hát
     
      (_this.isRepeat)? audio.play() :  btnNext.click();
    }

    btnNext.onclick = function () {
      _this.isRandom ? _this.randomSong() : _this.nextSong();
      audio.play();
      _this.render();
       _this.scrollTopActiveSong();
    };

    btnPrevious.onclick = function () {
      _this.isRandom ? _this.randomSong() : _this.previousSong();
      audio.play();
      _this.render();
      _this.scrollTopActiveSong();
    };

    btnRandom.onclick = function () {
      _this.isRandom = !_this.isRandom;
      btnRandom.classList.toggle("active", _this.isRandom);

      _this.setConfig('isRandom', _this.isRandom);
    };

    btnRepeat.onclick = function () {
       _this.isRepeat = !_this.isRepeat;
       btnRepeat.classList.toggle("active", _this.isRepeat);
       _this.setConfig('isRepeat', _this.isRepeat);
    };

    playList.onclick = function (e) {
      // const _this = this;
      const songElement = e.target.closest('.song:not(.active)');
      if (songElement || e.target.closest('.option')) {
        // Xử lý khi click vào song
        if (songElement) {
          _this.currentIndex = Number(songElement.dataset.index);
          _this.loadCurrentSong();
         _this.render();
          audio.play();

        }
      } 
    };

  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path;

    console.log(heading, cdThumb, audio);
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
    
  },

  previousSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  repeatSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
    audio.play();
  },

  loadConfig : function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  scrollTopActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView(
        {behavior: "smooth", block: "end", inline: "nearest"}
      );
    }, 300);
  },

  start: function () {
    this.loadConfig(); //Load from data
    this.defineProperties(); // Định nghĩa thuộc tính cho object
    this.handleEvent(); // Lắng nghe / xử lý các sự kiện (DOM EVENT)
    this.loadCurrentSong(); // Tải bài hát đầu tiên vào UI khi run app
    this.render(); // Render playlist
    btnRepeat.classList.toggle("active", this.isRepeat);
    btnRandom.classList.toggle("active", this.isRandom);
  },
};

app.start();

function showLog(params) {
  console.log(params);
}
