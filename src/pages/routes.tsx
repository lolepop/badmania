import App from "./index";
import Game from "./game";

export default {
    index: { route: "/", element: <App/> },
    game: { route: "/game", element: <Game/> }
};