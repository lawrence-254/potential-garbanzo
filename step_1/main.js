const app = Vue.createApp({
    data() {
        return {
            likes: 0,
            lives: 7
        }
    },
    methods: {
        update_likes() {
            this.likes += 1;
        }
    }
})