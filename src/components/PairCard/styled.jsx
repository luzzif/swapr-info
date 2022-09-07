import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 10px;

  margin: 0px 5px;
  padding: 20px;
  min-width: 250px;
  border-radius: 12px;

  box-shadow: ${({ theme }) => `0px 0.5px 0px 0.1px ${theme.bd1}`};
  background: linear-gradient(0deg, #171621, #171621),
    linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -185.11%, rgba(46, 23, 242, 0) 49.63%), rgba(57, 51, 88, 0.3);
  backdrop-filter: blur(25px);
  background-blend-mode: overlay, normal;
`;

export { Wrapper };
