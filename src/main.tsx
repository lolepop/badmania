import "./style.css";
import { render } from "preact";
import { Provider } from "react-redux";
import store from "./store/store";
import { HashRouter, Route, Routes } from "react-router-dom";
import routes from "./pages/routes";

render(
    <Provider store={store}>
        <HashRouter>
            <Routes>
                {Object.values(routes).map(route =>
                    <Route
                        path={route.route}
                        // @ts-expect-error
                        element={route.element}
                    />
                )}
            </Routes>
        </HashRouter>
    </Provider>
, document.body);
