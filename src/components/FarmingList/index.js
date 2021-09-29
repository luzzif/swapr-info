import React, { useState, useEffect } from "react";
import { useMedia } from "react-use";
import dayjs from "dayjs";
import LocalLoader from "../LocalLoader";
import utc from "dayjs/plugin/utc";
import { Box, Flex, Text } from "rebass";
import styled from "styled-components";

import { CustomLink } from "../Link";
import { Divider } from "../../components";
import { withRouter } from "react-router-dom";
import { formattedNum } from "../../utils";
import DoubleTokenLogo from "../DoubleLogo";
import FormattedName from "../FormattedName";
import QuestionHelper from "../QuestionHelper";
import { TYPE } from "../../Theme";
import {
  useNativeCurrencySymbol,
  useNativeCurrencyWrapper,
} from "../../contexts/Network";
import { AutoRow } from "../Row";
import TokenLogo from "../TokenLogo";
import { LiquidityMiningCampaign } from "@swapr/sdk";

dayjs.extend(utc);

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`;

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: "name liq vol";
  padding: 0 1.125rem;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: "name symbol liq vol ";

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: "name symbol liq vol price change";
  }
`;

const ListWrapper = styled.div``;

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`;

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const SORT_FIELD = {
  STAKE: 0,
  VOL: 1,
  TVL: 3,
  FEES: 4,
  APY: 5,
};

const FIELD_TO_VALUE = {
  [SORT_FIELD.STAKE]: "stakedAmount",
  [SORT_FIELD.VOL]: "oneDayVolumeUSD",
  [SORT_FIELD.TVL]: "stakablePair.reserveUSD",
  [SORT_FIELD.FEES]: "oneDayVolumeUSD",
};

function FarmingList({ otherData, pairs, color, disbaleLinks, maxItems = 10 }) {
  const below600 = useMedia("(max-width: 600px)");
  const below680 = useMedia("(max-width: 680px)");
  const below740 = useMedia("(max-width: 740px)");
  const below1080 = useMedia("(max-width: 1080px)");
  console.log("new one", otherData);
  console.log("old one", pairs);
  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.STAKE);

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [pairs]);

  useEffect(() => {
    if (pairs) {
      let extraPages = 1;
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(
        Math.max(
          1,
          Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages
        )
      );
    }
  }, [ITEMS_PER_PAGE, pairs]);

  const ListItem = ({ pairAddress, index }) => {
    console.log("pair try", pairAddress);

    const pairData = otherData[pairAddress];
    console.log("real one working", pairData);
    // console.log("pair data", pairData);

    if (otherData && otherData.length !== 0) {
      const apy = "1";
      return (
        <DashGrid
          style={{ height: "48px" }}
          disbaleLinks={disbaleLinks}
          focus={true}
        >
          <DataText area="name" fontWeight="500">
            {!below680 && (
              <div style={{ marginRight: "20px", width: "10px" }}>{index}</div>
            )}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.stakablePair.token0.id}
              a1={pairData.stakablePair.token1.id}
              defaultText0={pairData.stakablePair.token0.symbol}
              defaultText1={pairData.stakablePair.token1.symbol}
              margin={!below740}
            />
            <CustomLink
              style={{ marginLeft: "20px", whiteSpace: "nowrap" }}
              to={"/pair/" + pairAddress}
              color={color}
            >
              <FormattedName
                text={
                  (nativeCurrencyWrapper.symbol ===
                  pairData.stakablePair.token0.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token0.symbol) +
                  "-" +
                  (nativeCurrencyWrapper.symbol ===
                  pairData.stakablePair.token1.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token1.symbol)
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </DataText>
          <DataText area="liq">
            {formattedNum(pairData.stakedAmount)} LP
          </DataText>
          <DataText alignItems={"flex-end"} flexDirection={"column"} area="vol">
            <AutoRow
              justifyContent={"space-between"}
              marginBottom={"2px"}
              flexDirection={"row"}
            >
              <TokenLogo
                address={pairData.stakablePair.token0.id}
                size={"13px"}
                defaultText={pairData.stakablePair.token0.symbol}
              />
              <DataText>
                {formattedNum(pairData.stakablePair.reserve0)}
              </DataText>
              <FormattedName
                text={pairData.stakablePair.token0.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </AutoRow>
            <AutoRow justifyContent={"space-between"} flexDirection={"row"}>
              <TokenLogo
                address={pairData.stakablePair.token1.id}
                size={"13px"}
                defaultText={pairData.stakablePair.token1.symbol}
              />
              <DataText>
                {formattedNum(pairData.stakablePair.reserve1)}
              </DataText>
              <FormattedName
                text={pairData.stakablePair.token1.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </AutoRow>
          </DataText>
          {!below680 && (
            <DataText area="volWeek">
              {formattedNum(pairData.stakablePair.reserveUSD, true)}
            </DataText>
          )}

          {!below1080 && <DataText area="fees">42</DataText>}
          {!below1080 && <DataText area="apy">{apy}</DataText>}
        </DashGrid>
      );
    } else {
      return "";
    }
  };

  const otherDataList =
    otherData &&
    Object.keys(otherData)
      .sort((campaignA, campaignB) => {
        const pairA = otherData[campaignA];
        const pairB = otherData[campaignB];
        if (sortedColumn === SORT_FIELD.APY) {
          const apy1 = 22;
          const apy0 = 2;
          return apy0 > apy1
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1;
        }
        return parseFloat(pairA[FIELD_TO_VALUE[sortedColumn]]) >
          parseFloat(pairB[FIELD_TO_VALUE[sortedColumn]])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={index}>
              <ListItem
                key={index}
                index={(page - 1) * ITEMS_PER_PAGE + index + 1}
                pairAddress={pairAddress}
              />
              <Divider />
            </div>
          )
        );
      });

  return (
    <ListWrapper>
      <DashGrid
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: "fit-content", padding: "0 1.125rem 1rem 1.125rem" }}
      >
        <Flex alignItems="center" justifyContent="flexStart">
          <TYPE.main area="name">Name</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.STAKE);
              setSortDirection(
                sortedColumn !== SORT_FIELD.STAKE ? true : !sortDirection
              );
            }}
          >
            Staked{" "}
            {sortedColumn === SORT_FIELD.STAKE
              ? !sortDirection
                ? "↑"
                : "↓"
              : ""}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="vol"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.VOL);
              setSortDirection(
                sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection
              );
            }}
          >
            Underlying Tokens
            {sortedColumn === SORT_FIELD.VOL
              ? !sortDirection
                ? "↑"
                : "↓"
              : ""}
          </ClickableText>
        </Flex>
        {!below680 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="volWeek"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.TVL);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.TVL ? true : !sortDirection
                );
              }}
            >
              TVL{" "}
              {sortedColumn === SORT_FIELD.TVL
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}

        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="fees"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.FEES);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection
                );
              }}
            >
              Fees (24hr){" "}
              {sortedColumn === SORT_FIELD.FEES
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="apy"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.APY);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.APY ? true : !sortDirection
                );
              }}
            >
              1y Fees / Liquidity{" "}
              {sortedColumn === SORT_FIELD.APY
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
            <QuestionHelper text={"Based on 24hr volume annualized"} />
          </Flex>
        )}
      </DashGrid>
      <Divider />
      {/*<List p={0}>{!pairList ? <LocalLoader /> : pairList}</List>*/}
      <List p={0}>{!otherDataList ? <LocalLoader /> : otherDataList}</List>
      <PageButtons>
        <div
          onClick={(e) => {
            setPage(page === 1 ? page : page - 1);
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{"Page " + page + " of " + maxPage}</TYPE.body>
        <div
          onClick={(e) => {
            setPage(page === maxPage ? page : page + 1);
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  );
}

export default withRouter(FarmingList);
