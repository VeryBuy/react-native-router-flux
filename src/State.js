export function getActiveStateExceptDrawer(param) {
  const state = param;
  if (!state.routes) {
    return state;
  }
  if (state.routes[state.index].routeName === 'DrawerOpen') {
    return getActiveState(state.routes[0]);
  }
  return getActiveState(state.routes[state.index]);
}

export function isActiveRoute(state, routeName) {
  if (state.routeName === routeName) {
    return true;
  }
  if (!state.routes) {
    return state.routeName === routeName;
  }
  if (state.routes[state.index].routeName === 'DrawerOpen') {
    return isActiveRoute(state.routes[0], routeName);
  }
  return isActiveRoute(state.routes[state.index], routeName);
}

export function getRouteNameByKey(state, key) {
  if (state.key === key) {
    return state.routeName;
  }
  if (!state.routes) {
    return state.routeName;
  }
  if (state.routes[state.index].key === key) {
    return state.routes[state.index].routeName;
  }
  return getRouteNameByKey(state.routes[state.index], key);
}

export function getActiveState(param, parent) {
  const state = param;
  if (!state.routes) {
    return { ...state, parent };
  }
  return getActiveState(state.routes[state.index], { ...state, parent });
}

export function getParent(state, routeName, parent) {
  if (state.routeName === routeName) {
    return parent;
  }
  if (!state.routes) {
    return null;
  }
  for (let i = 0; i < state.routes.length; i += 1) {
    const res = getParent(state.routes[i], routeName, state);
    if (res) {
      return res;
    }
  }
  return null;
}

export function inject(state, key, index, routes) {
  if (!state.routes) {
    return state;
  }
  if (state.key === key) {
    if (routes) {
      return { ...state, routes, index };
    }
    return { ...state, index };
  }
  return { ...state, routes: state.routes.map(x => inject(x, key, index, routes)) };
}

export function popPrevious(state, routeName) {
  const parent = getParent(state, routeName);
  // console.log('FOUND PARENT:', JSON.stringify(parent));
  const { key, index } = parent;
  if (index) {
    const routes = [...parent.routes.slice(0, index - 1), ...parent.routes.slice(index)];
    const newState = inject(state, key, index - 1, routes);
    return newState;
  }
  return state;
}

// custom push
const ROUTE_LIMIT = 5;
export function customPush(state, routeName) {
  const parent = getParent(state, routeName);
  const { key, index } = parent;
  const checkRouteName = item => item.routeName === routeName;
  // find the index of the first item same with the routeName
  const firstIdxWithRouteName = parent.routes.length > ROUTE_LIMIT ? parent.routes.findIndex(checkRouteName) : -1;

  // it cause trim the routes if the followings are fullfilled:
  // * firstIdxWithRouteName > -1
  // * the difference between firstIdxWithRouteName and index > 5
  //    means 6, 7, 8.... stacks will remove the first same route from the start
  if (firstIdxWithRouteName > -1 && index - firstIdxWithRouteName > ROUTE_LIMIT) {
    const routes = [...parent.routes.slice(0, firstIdxWithRouteName), ...parent.routes.slice(firstIdxWithRouteName + 1)];
    const newState = inject(state, key, index - 1, routes);

    return newState;
  }
  return state;
}
