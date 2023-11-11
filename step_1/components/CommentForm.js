app.component('comment-box', {
    template: /*html*/`
<form class="comment">
    <h5>Comment on your star</h5>
    <label for="name">Name:</label>
    <input id="name"/>
    <label for="comments">Comments</label>
    <textarea id="comments"></textarea>
    <label for="ratings">Stars</label>
    <select id="ratings">
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
    }
})