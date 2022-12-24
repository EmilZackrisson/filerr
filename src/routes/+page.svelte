<script lang="ts">
    import PocketBase, { Record } from "pocketbase";
//   import settingsSvg from "./assets/settings.svg";

  const pb = new PocketBase("https://filerr.local.emilzackrisson.se");

  console.log("Logged In: ", pb.authStore.isValid);

  let requests:any = [];
  let admin = false;

  async function submitLogin(event: Event) {
    // event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("username") as string;
    const password = formData.get("password") as string;
    console.log(email, password);
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.message);
        if (err.message === "Failed to authenticate.") {
          alert("Fel användarnamn eller lösenord");
        } else {
          alert("Något gick fel");
        }
      });
  }

  function logout() {
    pb.authStore.clear();
    window.location.reload();
  }

  async function requestFile(event: Event) {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const file = formData.get("file") as string;
    const type = formData.get("type") as string;
    const data = {
      file: file,
      completed: false,
      type: type,
      user: pb.authStore.model?.id,
    };

    const record = await pb
      .collection("requests")
      .create(data)
      .then(() => {
        window.location.reload();
      });
  }

  async function getRequests() {
    console.log("Getting requests");
    const records = await pb
      .collection("requests")
      .getFullList(50 /* batch size */, {
        sort: "-created",
        expand: "user",
      })
      .then((records) => {
        requests = records;
        console.log("Got requests", requests);
      });
  }

  if (pb.authStore.isValid) {
    console.log("User: ", pb.authStore.model?.id);
    if (pb.authStore.model?.id === "jcj1e83y9nsfi3q") {
      console.log("You are admin");
      admin = true;
    }
    getRequests();
  }

  async function removeRequest(id: string) {
    await pb
      .collection("requests")
      .delete(id)
      .then(() => {
        window.location.reload();
      });
  }


</script>

<main>
    <!-- Header -->
  <div class="container text-center">
    <div class="d-flex justify-content-between flex-row">
      
      
      <h1>Filerr</h1>
      <div class="d-flex justify-content-end align-items-center">
        {#if pb.authStore.isValid}
          <p>{pb.authStore.model?.email}</p>
          <button on:click={logout} class="btn btn-primary">Logga ut</button>
        {/if}
      </div>
    </div>
  </div>

  {#if pb.authStore.isValid}
    <div class="container-sm card mt-3">
      <h3>Ansök om fil</h3>
      <form on:submit|preventDefault={requestFile}>
        <label for="file">Vad vill du ha?</label>
        <input
          type="text"
          class="form-control mb-3"
          id="fileInput"
          name="file"
        />
        <label for="type">Välj en typ</label>
        <select class="form-select mb-3" name="type">
          <option selected>Välj en typ</option>
          <option value="Spel">Spel</option>
          <option value="Program">Program</option>
          <option value="Annat">Annat</option>
        </select>
        <button type="submit" class="btn btn-primary mb-3">Skicka</button>
      </form>
    </div>
    <div class="container-sm mt-5">
      <h3>Ansökningar</h3>
      <div>
        {#await requests}
          <h3>Laddar...</h3>
        {:then requests}
          {#each requests as request}
            <div class="card p-3">
              <h5>{request.file}</h5>
              <p>Från användare: {request.expand.user.name}</p>
              {#if request.user === pb.authStore.model?.id || admin}
                <button
                  class="btn btn-danger"
                  on:click={() => {
                    removeRequest(request.id);
                  }}>Ta bort</button
                >
              {/if}
            </div>
          {/each}
        {/await}
      </div>
    </div>
  {:else}
    <div class="container-sm">
      <form on:submit|preventDefault={submitLogin}>
        <div class="mb-3">
          <label for="username" class="form-label">Användarnamn</label>
          <input
            type="text"
            class="form-control"
            id="username"
            name="username"
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Lösenord</label>
          <input
            type="password"
            class="form-control"
            id="password"
            name="password"
          />
        </div>
        <button type="submit" class="btn btn-primary">Logga in</button>
      </form>
    </div>
  {/if}
</main>

<style>

</style>