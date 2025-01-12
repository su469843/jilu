import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="error-page">
      <h1>出错了！</h1>
      <h2>{error.status || '500'}</h2>
      <p>{error.message || '服务器出现了一些问题'}</p>
      <div className="error-details">
        {error.stack && <pre>{error.stack}</pre>}
      </div>
      <Link to="/" className="back-home">
        返回首页
      </Link>
    </div>
  );
}

export default ErrorPage; 