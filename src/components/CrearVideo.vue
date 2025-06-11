<template>
<div class="row row-cols-2 justify-content-center mt-4">
    <div class="col-12 col-xl col-sm-12 mt-2">
      <div class="card border-top border-5 mb-8">
        <div class="card-body">
          <label for="basic-url" class="form-label">Titulo del video</label>
          <div class="input-group mb-3">
            <input
              id="basic-url"
              v-model="titulo"
              type="text"
              class="form-control"
              aria-describedby="basic-addon3"
            />
          </div>
          <label for="basic-url" class="form-label">Descripcion del video</label>
          <div class="input-group mb-3">
            <input
              id="basic-url"
              v-model="descripcion"
              type="text"
              class="form-control"
              aria-describedby="basic-addon3"
            />
          </div>

          <div class="input-group mb-3">
            <label for="basic-url" class="form-label"
              >Copia el IFRAME del video desde Youtube</label
            >
            <div class="input-group mb-3">
              <input
                id="basic-url"
                v-model="urlVideo"
                type="text"
                class="form-control"
                aria-describedby="basic-addon3"
              />
            </div>
          </div>

          <div class="col-xl-12 col-sm-12 col-12 text-center mt-2">
            <button
              class="btn text-light rounded-8"
              style="background: #5ebea3"
              @click="subirVideo()"
            >
              <i class="fas fa-paper-plane" /> ENVIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const titulo = ref("");
const descripcion = ref("");
const urlVideo = ref("");
const router = useRouter();

async function subirVideo() {
  try {
    if (titulo.value === "") {
      throw Error("Introduce el título del anuncio");
    }

    if (urlVideo.value === "") {
      throw Error("Introduce la url del video");
    }
    const doc = {
      titulo: titulo.value,
      descripcion: descripcion.value,
      urlVideo: urlVideo.value,
    };

    const res = await axiosInstance.post("cultura365/nuevoVideo", doc);

    if (!res.data?.ok) throw Error(res.data.message);

    Swal.fire({
      icon: "success",
      title: "Perfecto",
      showCancelButton: false,
      timer: 2000,
    });
    router.push("/videoCultura");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema", "error");
  }
}
</script>

<style scoped>
.cardDocs {
  background-color: #fafafa;
}

.roundIcon {
  background-color: #c6f5d5;
}
</style>
