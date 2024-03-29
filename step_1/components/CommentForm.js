app.component('comment_box', {
    template: /*html*/`
<form class="comment" @submit.prevent="onSubmit">
    <h5>Comment on your star</h5>
    <label for="name">Name:</label>
    <input id="name" v-model="name"/>
    <label for="comments">Comments</label>
    <textarea id="comments" v-model="comments"></textarea>
    <label for="ratings">Stars</label>
    <select id="ratings" v-model.number="ratings">
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
        <option>6</option>
        <option>7</option>
        <option>8</option>
        <option>9</option>
    </select>

    <input type="submit" value="submit"/>
</form>`,
    data() {
        return {
            name: "",
            comments: "",
            ratings: null
        }
    },
    methods: {
        onSubmit() {
            if (this.name == '' || this.comments == '' || this.ratings == null) {
                alert("Error, fields cannot be blank")
                return
            }
            let userRated = {
                name: this.name,
                comments: this.comments,
                ratings: this.ratings
            }
            this.$emit('submit-user-rated', userRated);

            this.name = '';
            this.comments = '';
            this.ratings = null;
        }
    }
})