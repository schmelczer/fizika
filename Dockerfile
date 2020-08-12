FROM mattrayner/lamp:latest-1804
COPY . app/
CMD ["/run.sh"]
