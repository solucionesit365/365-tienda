<template>
  <router-link
    to="/crear-anuncio"
    class="text-decoration-none"
    v-if="hasPermission('CrearAnuncios')"
  >
    <button class="btn colorIconGreen rounded-8 ms-4">
      <i class="fas fa-plus" /> CREAR ANUNCIO
    </button>
  </router-link>
  <div class="row mt-4 mb-8">
    <template v-if="!hayAnuncios">
      <div class="col-xl-12 col-xs-12 col-12 col-lg-6 text-center">
        <figure class="figure">
          <img
            src="@/assets/img/nodata.png"
            class="rounded mx-auto d-block mt-3 img-fluid"
            alt="..."
            style="width: 70%"
          />
          <figcaption class="figure-caption text-center">No hay anuncios que mostrar</figcaption>
        </figure>
      </div>
    </template>

    <script setup lang="ts"></script>

    <style scoped>
            .colorIconGreen {
        background-color: #63ceb0;
        color: white;
      }

      .c-details span {
        font-weight: 300;
        font-size: 13px;
      }

      .icon {
        width: 45px;
        height: 45px;
        background-color: #eee;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        // color: #16d39a
      }

      .formulario::v-deep(iframe) {
        width: 100% !important;
        height: 100% !important;
      }

      .formulario::v-deep(iframe) {
        width: 100% !important;
      }

      .modal.fade .modal-dialog {
        -webkit-transition: -webkit-transform 0.3s ease-out;
        -moz-transition: -moz-transform 0.3s ease-out;
        -o-transition: -o-transform 0.3s ease-out;
        transition: transform 0.3s ease-out;
      }

      // @media only screen and (max-device-width: 801px) and (min-device-width: 320px) and (-webkit-min-device-pixel-ratio: 3) {
      //     #formulario {
      //         width: 23rem;
      //     }
      // }

      //test2
      #test2 {
        background: #333;
        background: -webkit-gradient(
          radial,
          center center,
          120,
          center center,
          900,
          from(#33495e),
          to(#2e2329)
        );
        background: -moz-radial-gradient(circle, #33495e, #2e2329);
      }

      .loader2 {
        margin: 80px auto;
      }

      h1 {
        font-family: "Actor", sans-serif;
        color: #fff;
        font-size: 16px;
        letter-spacing: 1px;
        font-weight: 200;
        text-align: center;
      }

      .loader2 span {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-block;
        position: absolute;
        left: 50%;
        margin-left: -10px;
        -webkit-animation: 3s infinite linear;
        -moz-animation: 3s infinite linear;
        -o-animation: 3s infinite linear;
      }

      .loader2 span:nth-child(2) {
        background: #e84c3d;
        -webkit-animation: kiri 1.2s infinite linear;
        -moz-animation: kiri 1.2s infinite linear;
        -o-animation: kiri 1.2s infinite linear;
      }

      .loader2 span:nth-child(3) {
        background: #f1c40f;
        z-index: 100;
      }

      .loader2 span:nth-child(4) {
        background: #2fcc71;
        -webkit-animation: kanan 1.2s infinite linear;
        -moz-animation: kanan 1.2s infinite linear;
        -o-animation: kanan 1.2s infinite linear;
      }

      @-webkit-keyframes kanan {
        0% {
          -webkit-transform: translateX(20px);
        }

        50% {
          -webkit-transform: translateX(-20px);
        }

        100% {
          -webkit-transform: translateX(20px);
          z-index: 200;
        }
      }

      @-moz-keyframes kanan {
        0% {
          -moz-transform: translateX(20px);
        }

        50% {
          -moz-transform: translateX(-20px);
        }

        100% {
          -moz-transform: translateX(20px);
          z-index: 200;
        }
      }

      @-o-keyframes kanan {
        0% {
          -o-transform: translateX(20px);
        }

        50% {
          -o-transform: translateX(-20px);
        }

        100% {
          -o-transform: translateX(20px);
          z-index: 200;
        }
      }

      @-webkit-keyframes kiri {
        0% {
          -webkit-transform: translateX(-20px);
          z-index: 200;
        }

        50% {
          -webkit-transform: translateX(20px);
        }

        100% {
          -webkit-transform: translateX(-20px);
        }
      }

      @-moz-keyframes kiri {
        0% {
          -moz-transform: translateX(-20px);
          z-index: 200;
        }

        50% {
          -moz-transform: translateX(20px);
        }

        100% {
          -moz-transform: translateX(-20px);
        }
      }

      @-o-keyframes kiri {
        0% {
          -o-transform: translateX(-20px);
          z-index: 200;
        }

        50% {
          -o-transform: translateX(20px);
        }

        100% {
          -o-transform: translateX(-20px);
        }
      }

      #bodycard {
        background-color: #ddd;
      }

      .loading {
        position: relative;
        width: 500px;
        height: 120px;
        margin: 0 auto;
      }

      .loading .cloud {
        position: absolute;
        top: 50px;
        left: 10px;
        width: 170px;
        height: 60px;
        border-radius: 25%/75%;
        background-color: #fdfdfd;
        animation: pulse 2500ms;
        animation-iteration-count: infinite;
        z-index: 1;
      }

      .loading .cloud:before {
        content: " ";
        position: absolute;
        top: -23px;
        left: 25px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #fdfdfd;
      }

      .loading .cloud:after {
        content: " ";
        position: absolute;
        top: -40px;
        left: 60px;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background-color: #fdfdfd;
      }

      .loading .data {
        font-family: monospace;
        position: absolute;
        top: 60px;
        left: 120px;
        z-index: 0;
      }

      .loading .data > span {
        display: inline-block;
        animation: flyby 2.5s;
        animation-iteration-count: infinite;
        transform: translate(0, 0);
        padding: 3px;
      }

      .loading .data > span:nth-child(7) {
        animation-delay: 140ms;
      }

      .loading .data > span:nth-child(6) {
        animation-delay: 280ms;
      }

      .loading .data > span:nth-child(5) {
        animation-delay: 420ms;
      }

      .loading .data > span:nth-child(4) {
        animation-delay: 560ms;
      }

      .loading .data > span:nth-child(3) {
        animation-delay: 700ms;
      }

      .loading .data > span:nth-child(2) {
        animation-delay: 840ms;
      }

      .loading .data > span:nth-child(1) {
        animation-delay: 980ms;
      }

      .loading .browser {
        position: absolute;
        right: 0px;
        top: 10px;
        width: 140px;
        height: 100px;
        border-radius: 4px;
        background-color: #aaa;
        z-index: 1;
      }

      .loading .browser:before {
        content: " ";
        position: absolute;
        height: 78px;
        bottom: 2px;
        left: 2px;
        right: 2px;
        border-radius: 0 0 2px 2px;
        opacity: 0.9;
        background-color: white;
        z-index: 2;
      }

      .loading .browser:after {
        content: " ";
        position: absolute;
        height: 78px;
        bottom: 2px;
        left: 2px;
        right: 2px;
        border-radius: 0 0 2px 2px;
        opacity: 0.9;
        background-color: #8cb6d8;
        z-index: 2;
        animation: fill 2.5s;
        animation-iteration-count: infinite;
      }

      .loading .browser .buttons {
        display: inline-block;
        position: absolute;
        left: 20px;
        top: 5px;
        float: left;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #ffc107;
        opacity: 0.8;
      }

      .loading .browser .buttons:before {
        content: " ";
        display: inline-block;
        position: absolute;
        left: -15px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #f44336;
      }

      .loading .browser .buttons:after {
        content: " ";
        display: inline-block;
        position: absolute;
        left: 15px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #4caf50;
      }

      @keyframes pulse {
        7% {
          transform: scale(1, 1);
        }

        14% {
          transform: scale(1.1, 1.1);
        }

        30% {
          transform: scale(1, 1);
        }
      }

      @keyframes fill {
        0% {
          height: 0px;
          opacity: 1;
        }

        35% {
          height: 0px;
        }

        89% {
          height: 78px;
        }

        89% {
          opacity: 1;
        }

        100% {
          opacity: 0;
        }
      }

      @keyframes flyby {
        0% {
          transform: translate(0px, 0);
          opacity: 1;
          animation-timing-function: ease-out;
        }

        7% {
          transform: translate(60px, 0);
          animation-timing-function: linear;
        }

        30% {
          transform: translate(80px, 0);
          animation-timing-function: linear;
        }

        40% {
          transform: translate(230px, 0);
          animation-timing-function: ease-out;
        }

        60% {
          transform: translate(240px, 0);
          animation-timing-function: ease-out;
        }

        100% {
          transform: translate(240px, 0);
          opacity: 0;
        }
      }
    </style>
  </div>
</template>
