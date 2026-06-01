# Blog Application API - Documentation

## Resources

- App Base Url
    - https://movieapp-api-lms1.onrender.com

- Admin User
	- userName: "admin"
    - email: "admin@mail.com"
    - password: "admin123"
- User
	- userName: "John2026"
	- email: "johnd@mail.com"
	- password: "password123"

## References

## Endpoints

### Users

#### [POST] - "/users/login"

- Sample Request Body

    ```json

    {
        "userName": "SampleUserName",
        "password": "samplePw123"
    }

    ```

#### [POST] - "/users/register"

- Sample Request Body

    ```json

    {
    	"userName": "SampleUserName",
        "email": "sample@mail.com",
        "password": "samplePw123"
    }

    ```
#### [GET] - "/users/details"

- No Request Body

#### [PUT] - "/users/profile"    

- Sample Request Body

```json
	{

	    "firstName": "John",
	    "lastName": "Doe"
	}

```
### Blog

#### [GET] - "/blogs/getMyBlogs"

- No Request Body

#### [GET] - "/blogs/getAllBlogs"

- No Request Body

#### [POST] - "/blogs/createBlog"

- Sample Request Body

    ```json

    {
        "title": "Sample: Blog",
 		"content": "Sample Blog content"
    }

    ```

#### [PATCH] - "/blogs/updateMyBlog/:blogId"

- Sample Request Body

    ```json

    {
        "title": "Sample: Blog",
 		"content": "Sample Blog content"
    }

    ```

#### [DELETE] - "/blogs/deleteMyBlog/:blogId"

- No Request Body

#### [DELETE] - "/blogs/deleteBlog/:blogId"

- No Request Body, admin required

#### [PATCH] - "/blogs/:blogId/addComment"

- Sample Request Body

```json
	{
		"comment": "sample comment"
	}
```
#### [PATCH] - "/blogs/:blogId/updateComment/:commentId"

- Sample Request Body

```json
	{
		"comment": "sample comment"
	}

```

#### [DELETE] - "/blogs/:blogId/deleteComment/:commentId"

- No Request Body