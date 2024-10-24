import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Write your post content...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', togglePostForm);
    document.getElementById('submitPost').addEventListener('click', handleSubmitPost);
});

async function loadPosts() {
    try {
        const posts = await backend.getPosts();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    
    const date = new Date(Number(post.timestamp / 1000000n)); // Convert nanoseconds to milliseconds
    
    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            By ${post.author} • ${date.toLocaleDateString()}
        </div>
        <div class="post-content">
            ${post.body}
        </div>
    `;
    
    return article;
}

function togglePostForm() {
    const form = document.getElementById('newPostForm');
    form.classList.toggle('hidden');
}

async function handleSubmitPost() {
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const content = quill.root.innerHTML;

    if (!title || !author || !content) {
        alert('Please fill in all fields');
        return;
    }

    try {
        await backend.createPost(title, content, author);
        
        // Reset form
        document.getElementById('postTitle').value = '';
        document.getElementById('authorName').value = '';
        quill.setContents([]);
        
        // Hide form
        togglePostForm();
        
        // Reload posts
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    }
}
