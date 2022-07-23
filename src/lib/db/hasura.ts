import { MagicUserMetadata } from "magic-sdk";
import { User } from "../../models/user";
import { Stat } from "../../models/stat";

/* ------ USERS ------ */

/* getIsNewUser */

interface GetUsersByIssuerHasuraResp {
  data: {
    users: User[];
  };
}

export const getIsNewUser = async (jwtToken: string, userIssuer: string) => {
  const operationsDoc = `
  query getUsersByIssuer ($issuer: String!) {
    users(where: {issuer: {_eq: $issuer}}) {
      id
      issuer
      email
      publicAddress
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "getUsersByIssuer",
    { issuer: userIssuer },
    jwtToken
  )) as GetUsersByIssuerHasuraResp;

  return resp?.data?.users?.length === 0;
};

/* createNewUser */

interface CreateNewUserHasuraResp {
  data: {
    insert_users: User[];
  };
}

export const createNewUser = async (
  jwtToken: string,
  didTokenMetadata: MagicUserMetadata
) => {
  const operationsDoc = `
  mutation createNewUser($issuer: String!, $email: String!, $publicAddress: String!) {
    insert_users(objects: {issuer: $issuer, email: $email, publicAddress: $publicAddress}) {
      returning {
        id
        issuer
        email
        publicAddress
      }
    }
  }`;

  const { issuer, email, publicAddress } = didTokenMetadata;

  if (!issuer || !email || !publicAddress) {
    throw new Error("Incomplete metadata provided");
  }

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "createNewUser",
    {
      issuer,
      email,
      publicAddress,
    },
    jwtToken
  )) as CreateNewUserHasuraResp;

  return resp;
};

/* ------ STATS ------ */

interface AlterStatsDestructuredParams {
  userIssuer: string;
  placeID: string;
  liked: boolean;
  viewed: boolean;
}

/* insertStat */

interface InsertStatHasuraResp {
  data: {
    insert_stats_one: Stat[];
  };
}

export const insertStat = async (
  jwtToken: string,
  { userIssuer, placeID, liked, viewed }: AlterStatsDestructuredParams
) => {
  const operationsDoc = `
  mutation insertStat($userIssuer: String!, $placeID: String!, $liked: Boolean!, $viewed: Boolean!) {
    insert_stats_one(object: {
      userIssuer: $userIssuer,
      placeID: $placeID,
      liked: $liked,
      viewed: $viewed
    }) {
      id
      userIssuer
      placeID
      liked
      viewed
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "insertStat",
    { userIssuer, placeID, liked, viewed },
    jwtToken
  )) as InsertStatHasuraResp;

  return resp.data.insert_stats_one[0];
};

/* updateStat */

interface UpdateStatHasuraResp {
  data: {
    update_stats: Stat[];
  };
}

export const updateStat = async (
  jwtToken: string,
  { userIssuer, placeID, liked, viewed }: AlterStatsDestructuredParams
) => {
  const operationsDoc = `
  mutation updateStat($userIssuer: String!, $placeID: String!, $liked: Boolean!, $viewed: Boolean!) {
    update_stats(
      _set: {liked: $liked, viewed: $viewed},
      where: {
        userIssuer: {_eq: $userIssuer},
        placeID: {_eq: $placeID}
      }) {
        returning {
          id
          userIssuer
          placeID
          liked
          viewed
        }
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "updateStat",
    { userIssuer, placeID, liked, viewed },
    jwtToken
  )) as UpdateStatHasuraResp;

  return resp.data.update_stats[0];
};

/* getStat */

interface GetStatHasuraResp {
  data: {
    stats: Stat[];
  };
}

export const getStat = async (
  jwtToken: string,
  userIssuer: string,
  placeID: string
) => {
  const operationsDoc = `
  query getStat($userIssuer: String!, $placeID: String!) {
    stats(where: { userIssuer: {_eq: $userIssuer}, placeID: {_eq: $placeID }}) {
      id
      userIssuer
      placeID
      liked
      viewed
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "getStat",
    { userIssuer, placeID },
    jwtToken
  )) as GetStatHasuraResp;

  const statsArray = resp?.data?.stats;

  return statsArray && statsArray.length > 0 ? statsArray[0] : null;
};

/* getStats */

interface GetStatsHasuraResp {
  data: {
    stats: Stat[];
  };
}

export const getStats = async (jwtToken: string, userIssuer: string) => {
  const operationsDoc = `
  query getStats($userIssuer: String!) {
    stats(where: {
      userIssuer: {_eq: $userIssuer},
    }) {
      id
      userIssuer
      placeID
      liked
      viewed
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "getStats",
    { userIssuer },
    jwtToken
  )) as GetStatsHasuraResp;

  return resp.data?.stats;
};

/* getLikedPlacesStats */

interface GetLikedPlacesStatsHasuraResp {
  data: {
    stats: Stat[];
  };
}

export const getLikedPlacesStats = async (
  jwtToken: string,
  userIssuer: string
) => {
  const operationsDoc = `
  query getLikedPlacesStats($userIssuer: String!) {
    stats(where: {
      liked: {_eq: true}, 
      userIssuer: {_eq: $userIssuer},
    }) {
      id
      userIssuer
      placeID
      liked
      viewed
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "getLikedPlacesStats",
    { userIssuer },
    jwtToken
  )) as GetLikedPlacesStatsHasuraResp;

  return resp.data?.stats;
};

/* getViewedPlacesStats */

interface GetViewedPlacesStatsHasuraResp {
  data: {
    stats: Stat[];
  };
}

export const getViewedPlacesStats = async (
  jwtToken: string,
  userIssuer: string
) => {
  const operationsDoc = `
  query getViewedPlacesStats($userIssuer: String!) {
    stats(where: {
      viewed: {_eq: true}, 
      userIssuer: {_eq: $userIssuer},
    }) {
      id
      userIssuer
      placeID
      liked
      viewed
    }
  }`;

  const resp = (await queryHasuraGraphQL(
    operationsDoc,
    "getViewedPlacesStats",
    { userIssuer },
    jwtToken
  )) as GetViewedPlacesStatsHasuraResp;

  return resp.data?.stats;
};

/* GENERAL */

export const queryHasuraGraphQL = async (
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>,
  authToken: string
) => {
  if (!process.env.HASURA_ADMIN_URL) {
    throw new Error("HASURA_ADMIN_URL not set");
  }

  return fetch(process.env.HASURA_ADMIN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    }),
  }).then((result) => result.json());
};
