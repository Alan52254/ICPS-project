# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from routers.home        import router as home_router
from routers.export_csv  import router as export_csv_router
from routers.top_usage   import router as top_usage_router
from routers.health      import router as health_router
from routers.llm_chat    import router as llm_chat_router
from routers.chat_ui     import router as chat_ui_router
from routers.grafana     import router as grafana_router
from routers             import metrics

app = FastAPI(title="K8s Pod Metrics API")

# Mount static files first - enable HTML directory browsing
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

app.include_router(home_router,        tags=["home"])
app.include_router(export_csv_router,  prefix="/api", tags=["export"])
app.include_router(top_usage_router,   prefix="/api", tags=["top"])
app.include_router(health_router,      tags=["health"])
app.include_router(llm_chat_router,    prefix="/api", tags=["llm"])
app.include_router(chat_ui_router)
app.include_router(grafana_router)     # Includes /api/grafana endpoints
app.include_router(metrics.router)     # This includes /api/namespaces and /api/pod_metrics

if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    uvicorn.run(app, host=API_HOST, port=API_PORT)
