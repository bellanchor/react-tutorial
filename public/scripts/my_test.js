var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author={comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {author: '', text: ''};
    },
    updateName: function(e) {
        this.setState({author: e.target.value});
    },
    updateComment: function(e) {
        this.setState({text: e.target.value})
    },
    postComment: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return;
        }

        this.props.onCommentSubmit({author: author, text: text});
        this.setState({author: '', text: ''});
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.postComment}>
                <input type="text" name="author" placeholder="your name" value={this.state.author} onChange={this.updateName} />
                <input type="text" name="text" placeholder="your comment" value={this.state.text} onChange={this.updateComment} />
                <input type="submit" value="submit"/>
            </form>
        );
    }
});

var Comment = React.createClass({
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return { __html: rawMarkup };
    },

    render: function() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()}></span>
            </div>
        );
    }
});

var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },

    loadDataFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({data: data});
            },
            error: (xhr, status, err) => {
                console.error(err);
            }
        });
    },

    componentDidMount: function() {
        this.loadDataFromServer();
        setInterval(this.loadDataFromServer, this.props.pollInterval)
    },

    commentSubmit: function(comment) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: (data) => {
                this.setState({data: data});
            },
            error: (xhr, status, err) => {
                console.error(err);
            }
        });
    },

    render: function() {
        return (
            <div>
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.commentSubmit} />
            </div>
        );
    }
});

ReactDOM.render(
    <CommentBox url='/api/comments' pollInterval={2000} />,
    document.getElementById('content')
)
