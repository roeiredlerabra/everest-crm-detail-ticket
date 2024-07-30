const apiUrl = 'https://prod-23.westeurope.logic.azure.com:443/workflows/45f5307b684a4cc5a579aa96e832309f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bBHlquGX9DBwJWTd7u8fa1U-ySN0ZrtRcf9Q_csvOng';

function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const avatarImg = document.createElement('img');
    avatarImg.className = 'comment-avatar';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'comment-content';

    const authorDiv = document.createElement('div');
    authorDiv.className = 'comment-author';

    const textDiv = document.createElement('div');
    textDiv.className = 'comment-text';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'comment-date';
    dateDiv.textContent = new Date(comment.createdDate).toLocaleString();

    if (comment.text.startsWith('PortalUser&#58;')) {
        commentDiv.classList.add('comment-right');
        authorDiv.textContent = 'Portal User';
        textDiv.textContent = decodeHtmlEntities(comment.text.replace('PortalUser&#58;', '').trim());
        avatarImg.src = 'https://cdn3d.iconscout.com/3d/premium/thumb/user-6332708-5209354.png?f=webp';
    } else {
        commentDiv.classList.add('comment-left');
        authorDiv.textContent = comment.author.name;
        textDiv.textContent = decodeHtmlEntities(comment.text);
        avatarImg.src = 'https://expert-ca.com/storage/media/industries/1674276388industries.png';
    }

    commentDiv.appendChild(avatarImg);
    contentDiv.appendChild(authorDiv);
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(dateDiv);
    commentDiv.appendChild(contentDiv);

    return commentDiv;
}



        function setSpinnerVisibility(visible) {
        const spinner = document.getElementById('spinner');
        if (spinner) {
            spinner.style.display = visible ? 'block' : 'none';
        }
    }

    async function loadComments(commentsData) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        setSpinnerVisibility(true);
        chatContainer.innerHTML = ''; // Clear previous comments
        
        const spinner = document.createElement('div');
        spinner.id = 'spinner';
        spinner.className = 'spinner';
        chatContainer.appendChild(spinner);

        try {
            const id = document.getElementById('id').textContent.trim();
            let comments;
            if (commentsData) {
                comments = commentsData.d.results;
            } else {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any other headers your API requires
                    },
                    body: JSON.stringify({
                        // Add any required body parameters here
                         id: id 
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                comments = data.d.results;
            }

            chatContainer.removeChild(spinner);
            comments.forEach(comment => {
                const commentElement = createCommentElement(comment);
                chatContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Error loading comments:', error);
            chatContainer.innerHTML = 'Error loading comments. Please try again later.';
        } finally {
            setSpinnerVisibility(false);
        }
    }

    async function postComment() {
        const newCommentText = document.getElementById('newCommentText').value;
        if (!newCommentText.trim()) return; // Don't post empty comments

        setSpinnerVisibility(true);

        try {
            const id = document.getElementById('id').textContent.trim();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers your API requires
                },
                body: JSON.stringify({
                    text: `PortalUser:${newCommentText}`,
                    id: id 
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Clear the textarea
            document.getElementById('newCommentText').value = '';
            document.getElementById('newCommentText').style.height = '45px';

            // Update comments with the new data
            await loadComments(data);
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error posting comment. Please try again later.');
        } finally {
            setSpinnerVisibility(false);
        }
    }


    