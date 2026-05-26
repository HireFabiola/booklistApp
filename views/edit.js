<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/style.css">
    <title>Edit Book</title>
  </head>

  <body class="formPage bookPageView">
    <section class="formCard bookPage">
      <h1>Edit Book</h1>
      <form action="/books/<%= book._id %>?_method=PUT" method="POST">
        <div class="formGroup bookPageField">
          <label for="title">Title</label>
          <input id="title" type="text" name="title" value="<%= book.title %>" required />
        </div>
        <div class="formGroup bookPageField">
          <label for="author">Author</label>
          <input id="author" type="text" name="author" value="<%= book.author %>" required />
        </div>
        <div class="formGroup bookPageField">
          <label>
            <input type="checkbox" name="completed" <%= book.completed ? 'checked' : '' %> />
            Mark as completed
          </label>
        </div>
        <div class="formActions">
          <button class="smallBtn" type="submit">Submit Changes</button>
          <a class="smallBtn" href="/books">Back to List</a>
        </div>
      </form>
    </section>
  </body>
</html>