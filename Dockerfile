FROM ubuntu:22.04 as base

ENV DEBIAN_FRONTEND noninteractive

USER root

RUN apt-get update -y && apt-get install -y \
    software-properties-common \
    apt-transport-https \
    curl \
    # Only needed to build indy-sdk
    build-essential \
    git \
    libzmq3-dev libsodium-dev pkg-config

# libssl1.1 (required by libindy)

RUN curl http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1-1ubuntu2.1~18.04.21_amd64.deb -o libssl1.1.deb
RUN dpkg -i libssl1.1.deb

# libssl-dev1.1 (required to compile libindy with posgres plugin)
RUN curl http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl-dev_1.1.1-1ubuntu2.1~18.04.21_amd64.deb -o libssl-dev1.1.deb
RUN dpkg -i libssl-dev1.1.deb

# libindy
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
RUN add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"

# nodejs 16x LTS Debian
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -

# yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# install depdencies
RUN apt-get update -y && apt-get install -y --allow-unauthenticated \
    libindy \
    nodejs

# Install yarn seperately due to `no-install-recommends` to skip nodejs install 
RUN apt-get install -y --no-install-recommends yarn

# postgres plugin setup
# install rust and set up rustup
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# cargo build failing on latest release of rust due to socket2 dependency in the plugin https://users.rust-lang.org/t/build-broken-with-parse-quote-spanned-is-ambiguous/80280/2 so pointing rust version to 1.63.0
RUN rustup default 1.63.0

# clone indy-sdk and build postgres plugin
RUN git clone https://github.com/hyperledger/indy-sdk.git
WORKDIR /indy-sdk/experimental/plugins/postgres_storage/
RUN cargo build --release

# set up library path for postgres plugin
ENV LIB_INDY_STRG_POSTGRES="/indy-sdk/experimental/plugins/postgres_storage/target/release"

FROM base as final

# Demo App specifc setup
RUN yarn global add typescript

COPY ./tsconfig.json ./tsconfig.json

COPY ./package.json ./package.json

RUN yarn install

COPY ./src ./src

RUN yarn build

COPY ./views ./views

CMD ["yarn","start:dev"]